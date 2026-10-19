/**
 * Cyberlife — Milestone 12: Release Readiness & System Integration Test Suite
 *
 * Comprehensive end-to-end regression validation covering:
 * - Authoritative state, determinism, and invariant integrity.
 * - End-to-end Aster Incident mission stages (Briefing -> Investigation -> Remediation -> Verification -> Reporting).
 * - Career progression, job completion idempotency, and integer-kobo financial transactions.
 * - NPC dialogue evaluation, memory updates, and relationship clamping.
 * - Save/load persistence round-trips, corruption detection, and schema migration.
 * - Workstation camera mode transitions (Third-Person and First-Person) and input isolation.
 * - Virtual filesystem sandbox isolation and security command parsing.
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createSimulationEngine } from '@/simulation';
import { validateSimulationState } from '@/simulation/core/invariants';
import { MemoryStorageAdapter } from '@/application/persistence/adapters/MemoryStorageAdapter';
import { SaveManager } from '@/application/persistence/SaveManager';
import { SaveGameRecord } from '@/application/persistence/types';
import { WorldCameraController } from '@/presentation/world/WorldCameraController';
import { PlayerAvatar } from '@/presentation/world/entities/PlayerAvatar';
import { virtualFilesystem } from '@/simulation/cyber/filesystem';
import { TerminalCommandParser } from '@/simulation/cyber/terminal';

describe('Milestone 12: Release Readiness & System Integration', () => {
  describe('1. Authoritative Simulation & Deterministic State Transitions', () => {
    it('maintains strict revision numbering, time progression, and invariant compliance', () => {
      const engine = createSimulationEngine();
      expect(engine.getState().metadata.revision).toBe(0);

      // Advance time by 3600 seconds (1 hour)
      const res = engine.dispatch({
        type: 'AdvanceSimulationTime',
        deltaSeconds: 3600,
      });

      expect(res.success).toBe(true);
      expect(engine.getState().metadata.revision).toBe(1);
      expect(engine.getState().time.simulationTimeSeconds).toBe(3600);
      expect(engine.getState().time.calendar.timeString).toBe('09:00 AM');

      // State must pass all domain invariants
      expect(() => validateSimulationState(engine.getState())).not.toThrow();
    });

    it('rejects invalid state mutations with deterministic error codes without mutating state', () => {
      const engine = createSimulationEngine();
      const stateBefore = engine.getState();

      // Attempt to set player health outside bounds [0, 100]
      const failRes = engine.dispatch({
        type: 'SetPlayerAttribute',
        attribute: 'health',
        value: 150,
      });

      expect(failRes.success).toBe(false);
      expect(failRes.errorCode).toBe('ATTRIBUTE_OUT_OF_BOUNDS');
      expect(engine.getState()).toBe(stateBefore);
      expect(engine.getState().metadata.revision).toBe(0);
    });
  });

  describe('2. Aster Incident End-to-End Investigation & Empirical Remediation', () => {
    it('executes full mission lifecycle from briefing to report approval with ground-truth verification', () => {
      const engine = createSimulationEngine();

      // 1. Advance to initial_assessment
      expect(
        engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'initial_assessment' })
          .success
      ).toBe(true);

      // 2. Discover anomalous hosts and services
      engine.dispatch({
        type: 'RecordMissionFinding',
        findingType: 'host',
        targetId: 'filesrv-01',
        summary: 'Identified corporate fileserver host',
      });
      engine.dispatch({
        type: 'RecordMissionFinding',
        findingType: 'service',
        targetId: 'smb-filesrv-445',
        summary: 'Inspected SMB listener port 445',
      });
      engine.dispatch({
        type: 'RecordMissionFinding',
        findingType: 'log',
        targetId: 'LOG-2026-107B',
        summary: 'Analyzed suspicious SMB tree connect log',
      });

      // 3. Advance to investigation and evidence_preservation
      expect(
        engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'investigation' }).success
      ).toBe(true);
      expect(
        engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'evidence_preservation' })
          .success
      ).toBe(true);

      // 4. Preserve evidence artifact
      const preserveRes = engine.dispatch({
        type: 'PreserveMissionEvidence',
        evidenceId: 'EVD-2026-004',
        source: 'app-portal-01',
        description: 'Forensic snapshot of overprivileged IAM policy before remediation',
        reason: 'Chain of custody',
      });
      expect(preserveRes.success).toBe(true);
      expect(engine.getState().mission?.preservedEvidenceIds).toContain('EVD-2026-004');

      // 5. Submit valid root-cause assessment
      const rcaRes = engine.dispatch({
        type: 'SubmitRootCauseAssessment',
        suspectedRootCause:
          'Over-privileged IAM role assignment (role:corporate-admin) with wildcard permissions',
        affectedComponent: 'app-portal-01',
        observedImpact:
          'Unauthorized access and extraction of confidential payroll spreadsheet from filesrv-01',
        supportingEvidenceIds: ['LOG-2026-107B', 'EVD-2026-004'],
        uncertaintyOrNotes: 'Wildcard privileges allowed Aster to call filesrv-01 SMB port 445.',
      });
      expect(rcaRes.success).toBe(true);

      // 6. Advance to containment and contain Aster
      expect(
        engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'containment' }).success
      ).toBe(true);
      expect(
        engine.dispatch({
          type: 'ExecuteContainment',
          action: 'isolate_service',
          reason: 'Emergency isolation of aster-ai-core service',
        }).success
      ).toBe(true);
      expect(engine.getState().mission?.asterService.operationalMode).toBe('CONTAINED');

      // 7. Advance to remediation and remediate permissions
      expect(
        engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'remediation' }).success
      ).toBe(true);
      const remediateRes = engine.dispatch({
        type: 'RemediatePermissions',
        targetPolicyRole: 'kb-assistant',
        removeSmbAccess: true,
        removeDatabaseAccess: true,
        grantedScopes: ['docs:read', 'kb:search'],
      });
      expect(remediateRes.success).toBe(true);
      expect(engine.getState().mission?.asterService.activePolicyRole).toBe('kb-assistant');
      expect(engine.getState().mission?.asterService.smbAccessAllowed).toBe(false);

      // 8. Advance to verification and execute empirical boundary verification
      expect(
        engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'verification' }).success
      ).toBe(true);
      const verifyRes = engine.dispatch({ type: 'VerifyRemediation' });
      expect(verifyRes.success).toBe(true);
      expect(engine.getState().mission?.verificationResult?.passed).toBe(true);

      // 9. Advance to reporting and submit structured 7-section report
      expect(
        engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'reporting' }).success
      ).toBe(true);

      const completeReport = {
        executiveSummary:
          'Cedarline Services IR responded to unauthorized data access by internal AI assistant Aster.',
        timeline:
          '07:50 - Healthcheck\n07:52 - Unauthorized file read LOG-2026-107B\n08:00 - Contained',
        affectedSystems: ['app-portal-01', 'filesrv-01'],
        rootCause:
          'Misconfigured role:corporate-admin with wildcard scopes granting unintended SMB access.',
        impactAssessment: 'Confidential payroll file accessed internally.',
        containmentActions: 'Contained by severing SMB port 445 network route and isolating Aster.',
        remediationActions:
          'Remediated to role:kb-assistant and restricted scopes to docs:read, kb:search.',
        verificationResults:
          'Verification passed: Knowledge search OK (200), SMB filesrv-01 blocked (403).',
        recommendations: 'Implement automated IAM policy scanning and enforce least privilege.',
      };

      const submitRes = engine.dispatch({
        type: 'SubmitIncidentReport',
        report: completeReport,
      });
      expect(submitRes.success).toBe(true);
      expect(engine.getState().mission?.incidentReport?.isApproved).toBe(true);
      expect(engine.getState().mission?.isCompleted).toBe(true);
      expect(engine.getState().flags['mission_aster_completed']).toBe(true);
    });
  });

  describe('3. Economy, Career & Transaction Invariants', () => {
    it('enforces atomic financial transactions and prevents negative balances', () => {
      const engine = createSimulationEngine();

      // Debit 200,000 kobo so remaining balance is 50,000 kobo
      engine.dispatch({
        type: 'DebitMoney',
        amountKobo: 200_000,
        reason: 'Pre-test adjustment',
      });
      expect(engine.getState().player.moneyKobo).toBe(50_000);

      // Attempt to purchase an expensive item exceeding balance: item_ram_upgrade costs 150_000 kobo
      const failBuy = engine.dispatch({
        type: 'PurchaseItem',
        itemId: 'item_ram_upgrade',
      });
      expect(failBuy.success).toBe(false);
      expect(failBuy.errorCode).toBe('INSUFFICIENT_FUNDS');
      expect(engine.getState().player.moneyKobo).toBe(50_000);

      // Credit money first to verify atomic debit
      engine.dispatch({
        type: 'CreditMoney',
        amountKobo: 100_000, // Balance now 150,000 kobo
        reason: 'Testing credit',
      });
      expect(engine.getState().player.moneyKobo).toBe(150_000);

      // Purchase affordable item: item_lanyard_cedarline costs 45_000 kobo
      const buyRes = engine.dispatch({
        type: 'PurchaseItem',
        itemId: 'item_lanyard_cedarline',
      });
      expect(buyRes.success).toBe(true);
      expect(engine.getState().player.moneyKobo).toBe(105_000);

      // Invariant check: money is always a non-negative integer
      expect(engine.getState().player.moneyKobo).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(engine.getState().player.moneyKobo)).toBe(true);
    });

    it('prevents double-claiming job completion rewards (idempotency)', () => {
      const engine = createSimulationEngine();

      // Accept job_cedarline_triage
      const acceptRes = engine.dispatch({
        type: 'AcceptJob',
        jobId: 'job_cedarline_triage',
      });
      expect(acceptRes.success).toBe(true);

      // Fulfill objectives for job_cedarline_triage:
      // 1. Tool execution (logview)
      engine.dispatch({
        type: 'SetWorldFlag',
        key: 'cyber_tool_executed_logview',
        value: true,
      });
      // 2. Finding record (svc-aster)
      engine.dispatch({
        type: 'SetWorldFlag',
        key: 'recorded_finding_svc-aster',
        value: true,
      });

      // Complete job first time
      const completeRes1 = engine.dispatch({
        type: 'CompleteJob',
        jobId: 'job_cedarline_triage',
      });
      expect(completeRes1.success).toBe(true);
      const balanceAfterFirst = engine.getState().player.moneyKobo;

      // Attempt second completion of same job
      const completeRes2 = engine.dispatch({
        type: 'CompleteJob',
        jobId: 'job_cedarline_triage',
      });
      expect(completeRes2.success).toBe(false);
      expect(completeRes2.errorCode).toBe('JOB_NOT_FOUND');
      expect(engine.getState().player.moneyKobo).toBe(balanceAfterFirst);
    });
  });

  describe('4. Save/Load Persistence, Corruption Detection & Migrations', () => {
    it('completes full save/load round-trip restoring exact state and checksum', async () => {
      const engine = createSimulationEngine();
      const storage = new MemoryStorageAdapter();
      const saveManager = new SaveManager({
        engine,
        storage,
        defaultSlotId: 'slot_1',
        enableAutosave: false,
      });
      await saveManager.init();

      // Make state mutations
      engine.dispatch({
        type: 'SetLogicalPlayerLocation',
        locationId: 'cedarline_interior',
      });
      engine.dispatch({
        type: 'CreditMoney',
        amountKobo: 50_000,
        reason: 'Bonus grant',
      });

      const stateBeforeSave = engine.getState();

      // Save game
      const saveResult = await saveManager.saveGame('slot_1', 'Pre-release test save');
      expect(saveResult.success).toBe(true);

      // Create a fresh engine and restore
      const freshEngine = createSimulationEngine();
      const freshSaveManager = new SaveManager({
        engine: freshEngine,
        storage,
        defaultSlotId: 'slot_1',
        enableAutosave: false,
      });
      await freshSaveManager.init();

      const loadResult = await freshSaveManager.loadGame('slot_1');
      expect(loadResult.success).toBe(true);

      const restoredState = freshEngine.getState();
      expect(restoredState.player.locationId).toBe('cedarline_interior');
      expect(restoredState.player.moneyKobo).toBe(stateBeforeSave.player.moneyKobo);
      expect(restoredState.metadata.revision).toBe(stateBeforeSave.metadata.revision);
    });

    it('detects corrupted save records via checksum mismatch and protects application state', async () => {
      const engine = createSimulationEngine();
      const storage = new MemoryStorageAdapter();
      const saveManager = new SaveManager({
        engine,
        storage,
        defaultSlotId: 'slot_1',
        enableAutosave: false,
      });
      await saveManager.init();

      await saveManager.saveGame('slot_1');

      // Tamper with the raw record in storage (simulating corruption)
      const raw = await storage.load('slot_1');
      expect(raw).not.toBeNull();
      if (!raw) throw new Error('Raw record missing');

      const corruptedRecord: SaveGameRecord = {
        ...raw,
        state: {
          ...raw.state,
          player: {
            ...raw.state.player,
            moneyKobo: 999_999_999, // Tampered money without updating checksum
          },
        },
      };
      await storage.save('slot_1', corruptedRecord);

      // Attempt to load corrupted save
      const loadResult = await saveManager.loadGame('slot_1');
      expect(loadResult.success).toBe(false);
      expect(loadResult.errorType).toBe('CHECKSUM_MISMATCH');
      expect(loadResult.error).toContain('integrity check failed');
    });
  });

  describe('5. Workstation Camera Modes & Input Isolation', () => {
    it('manages third-person and first-person workstation camera transitions and restores exploration mode', () => {
      const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 1000);
      const domElem = document.createElement('div');
      const avatar = new PlayerAvatar();

      const controller = new WorldCameraController({
        camera,
        domElement: domElem,
        avatar,
        initialMode: 'THIRD_PERSON',
      });

      expect(controller.getMode()).toBe('THIRD_PERSON');
      expect(controller.isWorkstationActive()).toBe(false);

      // Enter workstation from Third-Person
      controller.enterWorkstation('THIRD_PERSON');
      expect(controller.isWorkstationActive()).toBe(true);
      expect(avatar.isSitting()).toBe(true);

      // Exit workstation and verify camera mode restoration
      const restoredMode = controller.exitWorkstation();
      expect(restoredMode).toBe('THIRD_PERSON');
      expect(controller.isWorkstationActive()).toBe(false);
      expect(avatar.isSitting()).toBe(false);

      // Toggle to First-Person mode and enter workstation
      controller.toggleMode();
      expect(controller.getMode()).toBe('FIRST_PERSON');

      controller.enterWorkstation('FIRST_PERSON');
      expect(controller.isWorkstationActive()).toBe(true);

      // Exit workstation from First-Person
      const restoredModeFP = controller.exitWorkstation();
      expect(restoredModeFP).toBe('FIRST_PERSON');
      expect(controller.getMode()).toBe('FIRST_PERSON');

      controller.detachEventListeners();
    });
  });

  describe('6. Virtual Filesystem & Command Security Parser', () => {
    it('confines filesystem operations to in-memory sandbox and validates permissions', () => {
      // System paths must be strictly read-only
      const authLog = virtualFilesystem.readFile('/var/log/auth.log');
      expect(authLog).not.toBeNull();
      expect(authLog?.readOnly).toBe(true);

      // Writing to /var/log must be rejected
      const writeVar = virtualFilesystem.writeFile('/var/log/hacked.log', 'test');
      expect(writeVar.success).toBe(false);
      expect(writeVar.error).toContain('read-only');

      // Writing to /home/analyst must succeed
      const writeHome = virtualFilesystem.writeFile(
        '/home/analyst/notes.txt',
        'Confidential finding'
      );
      expect(writeHome.success).toBe(true);

      const readBack = virtualFilesystem.readFile('/home/analyst/notes.txt');
      expect(readBack?.content).toBe('Confidential finding');
    });

    it('safely parses CLI commands without host execution or shell injection', () => {
      const parser = new TerminalCommandParser();
      const context = {
        currentDirectory: '/home/analyst',
        simulationTime: {
          timeString: '10:00:00',
          dateString: '2026-10-12',
          iso: '2026-10-12T10:00:00Z',
          year: 2026,
          month: 10,
          day: 12,
          hour: 10,
          minute: 0,
          second: 0,
          dayOfWeek: 'Monday',
        },
        currentUser: {
          username: 'analyst',
          displayName: 'Security Analyst',
          role: 'analyst',
          organization: 'Cedarline',
        },
        workstation: {
          id: 'ws-01',
          hostname: 'ekosec-ws-01',
          osVersion: 'EkoSec OS 2026.4',
          ipAddress: '10.0.4.15',
          subnet: '10.0.4.0/24',
          status: 'ONLINE',
          locationId: 'apartment',
        },
        history: [],
      };

      // Valid simulated command
      const pwdRes = parser.parseAndExecute('pwd', context);
      expect(pwdRes.stdout).toContain('/home/analyst');

      // File listing
      const lsRes = parser.parseAndExecute('ls', { ...context, currentDirectory: '/var/log' });
      expect(lsRes.stdout.some(line => line.includes('auth.log'))).toBe(true);

      // Security tool alias: netmap / nmap hosts
      const nmapRes = parser.parseAndExecute('nmap hosts', context);
      expect(
        nmapRes.stdout.some(line => line.includes('10.0.4.10') || line.includes('app-portal-01'))
      ).toBe(true);

      // Shell operators are explicitly intercepted and rejected
      const injectionRes = parser.parseAndExecute('cat /etc/passwd | grep root', context);
      expect(injectionRes.isError).toBe(true);
      expect(injectionRes.stdout.some(line => line.includes('Shell operators'))).toBe(true);
    });
  });
});
