/**
 * Cyberlife — Trace, Legal Exposure & Defender View Subsystem Test Suite
 *
 * Validates:
 * 1. Data-driven noise catalog (realistic values, ATT&CK techniques, log formats)
 * 2. Short-term Trace meter updates, OPSEC attenuation (Tor, VPN, off-hours)
 * 3. Time-based deterministic decay
 * 4. Deterministic threshold defender responses (Rate limit, SOC alert, Honeypot, IP block, Lockout)
 * 5. Scope and RoE enforcement, warning flow, evidence tainting
 * 6. Long-term Legal Exposure persistence and story trigger milestones
 * 7. Purple-team Defender View debrief generation and log line synthesis
 * 8. State invariant and save/load serialization round-trip
 */

import { describe, it, expect } from 'vitest';
import {
  calculateActionNoise,
  isActionInScope,
  recordActionNoise,
  decayTrace,
  applyOpsecAction,
  generateDefenderViewDebrief,
  createInitialTraceState,
  NOISE_ACTION_CATALOG,
  generateSyntheticLogLine,
} from '@/simulation/cyber/trace';
import { AuthorizedScopeDefinition } from '@/simulation/cyber/trace/types';
import { createInitialSimulationState } from '@/simulation/core/initialState';
import { dispatchCommand } from '@/simulation/commands/commandHandler';
import { validateSimulationState } from '@/simulation/core/invariants';

describe('Trace & Legal Exposure Subsystem', () => {
  describe('1. Data-Driven Noise Model Catalog', () => {
    it('defines realistic noise values across standard offensive and recon categories', () => {
      expect(NOISE_ACTION_CATALOG['passive_osint']!.baseNoise).toBe(5);
      expect(NOISE_ACTION_CATALOG['dns_lookup']!.baseNoise).toBe(5);
      expect(NOISE_ACTION_CATALOG['portscan_slow']!.baseNoise).toBe(20);
      expect(NOISE_ACTION_CATALOG['portscan_aggressive']!.baseNoise).toBe(60);
      expect(NOISE_ACTION_CATALOG['credential_stuffing']!.baseNoise).toBe(70);
      expect(NOISE_ACTION_CATALOG['auth_read_normal']!.baseNoise).toBe(10);
      expect(NOISE_ACTION_CATALOG['bulk_download']!.baseNoise).toBe(80);
      expect(NOISE_ACTION_CATALOG['exploit_attempt']!.baseNoise).toBe(85);
    });

    it('maps every catalog action to valid MITRE ATT&CK techniques and educational mitigations', () => {
      for (const [, def] of Object.entries(NOISE_ACTION_CATALOG)) {
        expect(def.attckTechniqueId).toMatch(/^T\d+(\.\d+)?$/);
        expect(def.attckTechniqueName.length).toBeGreaterThan(4);
        expect(def.detectionReason.length).toBeGreaterThan(10);
        expect(def.opsecMitigation.length).toBeGreaterThan(10);
        expect(['CEF', 'SYSMON', 'SURICATA_JSON', 'NGINX_ACCESS', 'FIREWALL_IPTABLES', 'DNS_QUERY']).toContain(
          def.logFormat
        );
      }
    });

    it('generates authentic, parseable simulated log lines without external dependencies', () => {
      const cefLog = generateSyntheticLogLine(
        'CEF',
        NOISE_ACTION_CATALOG['portscan_aggressive']!,
        'app-portal-01',
        '2026-10-12T08:15:00Z',
        '185.220.101.5'
      );
      expect(cefLog).toContain('CEF:0|CedarlineSec|OrionSIEM');
      expect(cefLog).toContain('src=185.220.101.5');
      expect(cefLog).toContain('dst=app-portal-01');

      const suricataLog = generateSyntheticLogLine(
        'SURICATA_JSON',
        NOISE_ACTION_CATALOG['exploit_attempt']!,
        'app-portal-01',
        '2026-10-12T08:15:00Z',
        '10.0.4.15'
      );
      const parsed = JSON.parse(suricataLog);
      expect(parsed.event_type).toBe('alert');
      expect(parsed.dest_ip).toBe('app-portal-01');
      expect(parsed.alert.signature_id).toBeDefined();
    });
  });

  describe('2. OPSEC Modifiers and Short-Term Trace Calculation', () => {
    it('attenuates noise when Tor or VPN are engaged', () => {
      const rawNoise = calculateActionNoise('portscan_aggressive', 'app-portal-01', {
        useTor: false,
        useVpn: false,
        isOffHours: false,
        cleanedLogs: false,
      });
      expect(rawNoise).toBe(60);

      const torNoise = calculateActionNoise('portscan_aggressive', 'app-portal-01', {
        useTor: true,
        useVpn: false,
        isOffHours: false,
        cleanedLogs: false,
      });
      // 60 * 0.65 = 39
      expect(torNoise).toBe(39);
      expect(torNoise).toBeLessThan(rawNoise);

      const fullOpsecNoise = calculateActionNoise('portscan_aggressive', 'app-portal-01', {
        useTor: true,
        useVpn: true,
        isOffHours: true,
        cleanedLogs: false,
      });
      // 60 * 0.65 * 0.85 * 0.85 = 28
      expect(fullOpsecNoise).toBe(28);
    });

    it('applies anti-forensic log sanitization to reduce trace meter', () => {
      let state = createInitialTraceState();
      state = { ...state, traceMeter: 70 };

      const updated = applyOpsecAction(state, 'WIPE_LOGS', 1000);
      expect(updated.traceMeter).toBe(50);
      expect(updated.opsecModifiers.cleanedLogs).toBe(true);
    });
  });

  describe('3. Deterministic Time Decay', () => {
    it('decays trace meter by 1 point per 45 seconds of simulation time', () => {
      let state = createInitialTraceState();
      state = { ...state, traceMeter: 50, lastDecaySimTime: 0 };

      // After 90 seconds (2 intervals of 45s), trace drops by 2
      const decayed = decayTrace(state, 90);
      expect(decayed.traceMeter).toBe(48);
      expect(decayed.lastDecaySimTime).toBe(90);

      // Does not decay below 0
      state = { ...state, traceMeter: 1, lastDecaySimTime: 0 };
      const zeroDecay = decayTrace(state, 180);
      expect(zeroDecay.traceMeter).toBe(0);
    });
  });

  describe('4. Deterministic Defender Threshold Responses', () => {
    it('triggers rate limiting at 25% trace', () => {
      const state = createInitialTraceState();
      // Record slow port scan (+20 noise)
      const res1 = recordActionNoise(state, 'portscan_slow', 'app-portal-01', 100, '2026-10-12T08:00:00Z');
      expect(res1.state.traceMeter).toBe(20);
      expect(res1.newResponses.length).toBe(0);

      // Record another (+20 noise -> 40%)
      const res2 = recordActionNoise(res1.state, 'portscan_slow', 'app-portal-01', 120, '2026-10-12T08:01:00Z');
      expect(res2.state.traceMeter).toBe(40);
      expect(res2.newResponses.some(r => r.type === 'RATE_LIMIT')).toBe(true);
    });

    it('triggers SOC alert and honeypot deployment at 50% trace', () => {
      const state = createInitialTraceState();
      // Aggressive scan on target (+60 noise)
      const res = recordActionNoise(state, 'portscan_aggressive', 'app-portal-01', 100, '2026-10-12T08:00:00Z');
      expect(res.state.traceMeter).toBe(60);
      expect(res.newResponses.some(r => r.type === 'RATE_LIMIT')).toBe(true);
      expect(res.newResponses.some(r => r.type === 'SOC_ALERT')).toBe(true);
      expect(res.newResponses.some(r => r.type === 'HONEYPOT_EXPOSURE')).toBe(true);
    });

    it('triggers IP block at 75% and critical lockout at 90%', () => {
      let state = createInitialTraceState();
      state = { ...state, traceMeter: 70 };
      const res1 = recordActionNoise(state, 'portscan_slow', 'app-portal-01', 200, '2026-10-12T08:05:00Z');
      expect(res1.state.traceMeter).toBe(90);
      expect(res1.newResponses.some(r => r.type === 'IP_BLOCK')).toBe(true);
      expect(res1.newResponses.some(r => r.type === 'FULL_LOCKOUT')).toBe(true);
    });
  });

  describe('5. Scope, RoE Enforcement, and Evidence Tainting', () => {
    const corporateScope: AuthorizedScopeDefinition = {
      jobId: 'TKT-2026-1012',
      clientName: 'Cedarline Solutions',
      missionName: 'Cedarline Internal Audit',
      authorizedHosts: ['filesrv-01', '10.0.4.20'],
      authorizedPorts: [445, 139],
      prohibitedTargets: ['vault-core-01.transit.internal'],
      description: 'Authorized audit of staging fileserver',
    };

    it('validates authorized vs out-of-scope targets correctly', () => {
      let state = createInitialTraceState();
      state = { ...state, activeScope: corporateScope };

      const inScopeCheck = isActionInScope(state, 'portscan_slow', 'filesrv-01');
      expect(inScopeCheck.inScope).toBe(true);

      const outOfScopeCheck = isActionInScope(state, 'portscan_slow', 'app-portal-01');
      expect(outOfScopeCheck.inScope).toBe(false);
      expect(outOfScopeCheck.reason).toContain('outside authorized scope');

      const prohibitedCheck = isActionInScope(state, 'portscan_slow', 'vault-core-01.transit.internal');
      expect(prohibitedCheck.inScope).toBe(false);
      expect(prohibitedCheck.reason).toContain('Prohibited Assets');
    });

    it('marks evidence as tainted and raises legal exposure on out-of-scope actions', () => {
      let state = createInitialTraceState();
      state = { ...state, activeScope: corporateScope };

      // In-scope action does NOT increase legal exposure
      const resInScope = recordActionNoise(state, 'portscan_slow', 'filesrv-01', 100, '2026-10-12T08:00:00Z');
      expect(resInScope.state.legalExposureMeter).toBe(0);
      expect(resInScope.state.taintedEvidenceIds.length).toBe(0);

      // Out-of-scope action INCREASES legal exposure and flags tainted evidence
      const resOutScope = recordActionNoise(state, 'portscan_slow', 'app-portal-01', 110, '2026-10-12T08:01:00Z');
      expect(resOutScope.state.legalExposureMeter).toBeGreaterThan(0);
      expect(resOutScope.state.taintedEvidenceIds.length).toBe(1);
      expect(resOutScope.state.taintedEvidenceIds[0]).toContain('EVD-UNAUTH-app-portal-01');
    });
  });

  describe('6. Long-Term Legal Exposure & Narrative Milestones', () => {
    it('fires progressive story triggers at 40%, 65%, and 85% legal exposure', () => {
      let state = createInitialTraceState();

      // Push legal exposure to 45%
      state = { ...state, legalExposureMeter: 45 };
      const res1 = recordActionNoise(state, 'portscan_slow', 'external-target', 100, '2026-10-12T08:00:00Z');
      expect(res1.state.storyTriggersFired).toContain('story_blessing_warning');

      // Push to 70%
      state = { ...state, legalExposureMeter: 70 };
      const res2 = recordActionNoise(state, 'portscan_slow', 'external-target', 200, '2026-10-12T08:05:00Z');
      expect(res2.state.storyTriggersFired).toContain('story_choker_surveillance');

      // Push to 90%
      state = { ...state, legalExposureMeter: 90 };
      const res3 = recordActionNoise(state, 'portscan_slow', 'external-target', 300, '2026-10-12T08:10:00Z');
      expect(res3.state.storyTriggersFired).toContain('story_ndsrc_subpoena');
    });
  });

  describe('7. Purple-Team Defender View Debrief Generation', () => {
    it('compiles chronological timeline of logged actions with MITRE ATT&CK and OPSEC lessons', () => {
      let state = createInitialTraceState();
      // Record 1 passive and 1 active action
      state = recordActionNoise(state, 'passive_osint', 'app-portal-01', 100, '2026-10-12T08:00:00Z').state;
      state = recordActionNoise(state, 'portscan_aggressive', 'app-portal-01', 120, '2026-10-12T08:02:00Z').state;

      const debrief = generateDefenderViewDebrief(state, 'ep01_night_intel', 200);

      expect(debrief.jobId).toBe('ep01_night_intel');
      expect(debrief.totalActions).toBe(2);
      expect(debrief.entries.length).toBe(2);
      expect(debrief.overallVerdict).toBe('SURVEILLED');

      const entry1 = debrief.entries[0]!;
      expect(entry1.status).toBe('MISSED');
      expect(entry1.logLine).toBeDefined();
      expect(entry1.blueTeamInsight).toContain('Target experiences zero inbound traffic');
      expect(entry1.redTeamLesson).toBeDefined();

      const entry2 = debrief.entries[1]!;
      expect(entry2.status).toBe('DETECTED');
      expect(entry2.attckTechniqueId).toBe('T1046');
    });
  });

  describe('8. Command Pipeline & Save/Load Invariants', () => {
    it('dispatches trace simulation commands and maintains full state invariants', () => {
      let simState = createInitialSimulationState();
      expect(simState.trace).toBeDefined();

      // Dispatch SetJobScope
      const scopeRes = dispatchCommand(simState, {
        type: 'SetJobScope',
        isNightJob: true,
        jobId: 'ep01_night_intel',
      });
      expect(scopeRes.success).toBe(true);
      simState = scopeRes.state;
      expect(simState.trace?.isNightJobActive).toBe(true);

      // Dispatch RecordActionNoise
      const noiseRes = dispatchCommand(simState, {
        type: 'RecordActionNoise',
        actionId: 'portscan_aggressive',
        target: 'app-portal-01',
      });
      expect(noiseRes.success).toBe(true);
      simState = noiseRes.state;
      expect(simState.trace?.traceMeter).toBe(60);

      // Verify state invariant passes cleanly
      expect(() => validateSimulationState(simState)).not.toThrow();

      // Test JSON save & load roundtrip
      const serialized = JSON.stringify(simState);
      const restored = JSON.parse(serialized);
      expect(() => validateSimulationState(restored)).not.toThrow();
      expect(restored.trace.traceMeter).toBe(60);
      expect(restored.trace.isNightJobActive).toBe(true);
    });
  });
});
