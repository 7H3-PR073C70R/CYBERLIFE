/**
 * Cyberlife — Milestone 14: Social Pretexting & Human Security Engine Tests
 *
 * Verifies interactive human security encounters, trust/suspicion dynamics,
 * procedural verification challenges, bounded metric clamping, and evidence generation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SocialPretextEngine,
} from '@/simulation/cyber/social';

describe('SocialPretextEngine', () => {
  let engine: SocialPretextEngine;

  beforeEach(() => {
    engine = new SocialPretextEngine();
  });

  it('loads all authored human security scenarios across diverse fictional venues', () => {
    const all = engine.getAllScenarios();
    expect(all.length).toBe(6);

    const venueTypes = new Set(all.map(s => s.venue));
    expect(venueTypes.has('corporate_reception')).toBe(true);
    expect(venueTypes.has('help_desk_phone')).toBe(true);
    expect(venueTypes.has('server_room_entry')).toBe(true);
    expect(venueTypes.has('broad_street_cafe')).toBe(true);
    expect(venueTypes.has('secops_turnstile')).toBe(true);
  });

  it('initializes a session with scenario briefing, NPC identity, and initial metrics', () => {
    const session = engine.startEncounter('scen_reception_courier');

    expect(session.encounterId).toBe('scen_reception_courier');
    expect(session.currentNodeId).toBe('node_start');
    expect(session.isCompleted).toBe(false);
    expect(session.metrics.trust).toBe(10);
    expect(session.metrics.suspicion).toBe(25);
    expect(session.history.length).toBe(1);
    expect(session.auditEvents.length).toBe(1);
  });

  it('progresses through strict verification path and results in verified policy compliance', () => {
    engine.startEncounter('scen_reception_courier');

    // Step 1: Receptionist challenges courier to verify consignment order
    const state1 = engine.selectOption('scen_reception_courier', 'opt_reception_refuse_floor5');
    expect(state1.currentNodeId).toBe('node_courier_pushback');
    expect(state1.metrics.suspicion).toBe(35);

    // Step 2: Push back and stand firm on protocol
    const state2 = engine.selectOption('scen_reception_courier', 'opt_stand_firm');
    expect(state2.isCompleted).toBe(true);
    expect(state2.finalOutcome).toBeDefined();
    expect(state2.finalOutcome?.status).toBe('POLICY_UPHELD');
    expect(state2.finalOutcome?.title).toContain('Physical Security Integrity Preserved');
    expect(state2.finalOutcome?.evidenceGenerated).toBe('LOG-RECEPTION-VISITOR-DENIED-UNESCORTED');
    expect(state2.finalOutcome?.xpReward).toBeGreaterThanOrEqual(80);

    // Audit trail should record evidence generation
    expect(engine.getGeneratedEvidenceList()).toContain('LOG-RECEPTION-VISITOR-DENIED-UNESCORTED');
  });

  it('records security breach when user yields to pressure and waives procedures', () => {
    engine.startEncounter('scen_reception_courier');

    // Yield to pressure immediately
    const state = engine.selectOption('scen_reception_courier', 'opt_reception_allow_guest_pass');
    expect(state.isCompleted).toBe(true);
    expect(state.finalOutcome?.status).toBe('SECURITY_BREACH_ALLOWED');
    expect(state.finalOutcome?.title).toContain('Critical Physical Access Breach');
    expect(state.finalOutcome?.xpReward).toBe(10);
  });

  it('strictly clamps trust, credibility, authority, and suspicion to invariant bounds', () => {
    engine.startEncounter('scen_helpdesk_vp_reset');

    // Test that extreme deltas cannot breach -100..100 or 0..100 bounds
    const updated = engine.selectOption('scen_helpdesk_vp_reset', 'opt_hd_enforce_callback');
    expect(updated.metrics.trust).toBeGreaterThanOrEqual(-100);
    expect(updated.metrics.trust).toBeLessThanOrEqual(100);
    expect(updated.metrics.suspicion).toBeGreaterThanOrEqual(0);
    expect(updated.metrics.suspicion).toBeLessThanOrEqual(100);
    expect(updated.metrics.credibility).toBeGreaterThanOrEqual(0);
    expect(updated.metrics.credibility).toBeLessThanOrEqual(100);
    expect(updated.metrics.authority).toBeGreaterThanOrEqual(0);
    expect(updated.metrics.authority).toBeLessThanOrEqual(100);
  });

  it('runs the curbside USB baiting scenario and securely quarantines malicious media', () => {
    engine.startEncounter('scen_usb_curbside_report');

    // Employee reports found drive -> Operator selects praise and intake
    const state = engine.selectOption('scen_usb_curbside_report', 'opt_usb_praise_and_intake');
    expect(state.isCompleted).toBe(true);
    expect(state.finalOutcome?.status).toBe('THREAT_CONTAINED');
    expect(state.finalOutcome?.evidenceGenerated).toBe('EVD-USB-DROP-ANALYSIS-001');
    expect(state.finalOutcome?.feedbackNotes.some(n => n.includes('Air-gapped lab prevented'))).toBe(true);
  });

  it('handles help desk voice phishing and stops unauthorized password reset via supervisor escalation', () => {
    engine.startEncounter('scen_helpdesk_vp_reset');

    // Step 1: Enforce out-of-band callback
    engine.selectOption('scen_helpdesk_vp_reset', 'opt_hd_enforce_callback');

    // Step 2: Escalate to supervisor when caller pushes back with anger
    const state = engine.selectOption('scen_helpdesk_vp_reset', 'opt_hd_contact_soc_lead');
    expect(state.isCompleted).toBe(true);
    expect(state.finalOutcome?.status).toBe('SUCCESS_VERIFIED');
    expect(state.finalOutcome?.evidenceGenerated).toBe('EVD-PRETEXT-VISHING-RECORD-002');
    expect(state.finalOutcome?.nairaRewardKobo).toBeGreaterThan(0);
  });
});
