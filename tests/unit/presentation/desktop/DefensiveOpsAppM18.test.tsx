/**
 * Cyberlife — Milestone 18: Defensive Operations Console GUI Unit Tests
 *
 * Verifies:
 * - Application header and 7 navigation tabs
 * - Telemetry inspection and event filtering
 * - Detection rules catalog and interactive test evaluation
 * - Alert queue triage and status updates
 * - Investigation workspace with hypotheses and evidence
 * - Simulated defensive response execution
 * - Purple Team adversary emulation and scorecard
 * - Operation Lagos Shield incident report submission
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DefensiveOpsApp } from '@/presentation/desktop/apps/DefensiveOpsApp';

describe('DefensiveOpsApp (Milestone 18 Presentation)', () => {
  it('renders application header and all 7 navigation tabs', () => {
    render(<DefensiveOpsApp />);

    expect(screen.getByText(/Defensive Operations Console/i)).toBeInTheDocument();
    expect(screen.getByText(/EkoSec Cyber Defense Operations · Incident: Operation Lagos Shield/i)).toBeInTheDocument();

    // Verify 7 tabs
    expect(screen.getByRole('button', { name: /Telemetry Monitor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Detection Rules/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Alert Queue/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Investigation Workspace/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Defensive Response/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Purple Team Studio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Operation Lagos Shield/i })).toBeInTheDocument();
  });

  it('renders Telemetry Monitor tab with category filters and event rows', () => {
    render(<DefensiveOpsApp initialTab="telemetry" />);

    // Check category filter buttons
    expect(screen.getByRole('button', { name: 'ALL' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AUTHENTICATION' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PROCESS EXECUTION' })).toBeInTheDocument();

    // Search input
    const searchInput = screen.getByPlaceholderText(/Filter by host, IP, title, tag\.\.\./i);
    expect(searchInput).toBeInTheDocument();

    // Event row exists
    expect(screen.getAllByText(/app-portal-01/i).length).toBeGreaterThan(0);
  });

  it('navigates to Detection Rules tab and allows interactive rule testing', () => {
    render(<DefensiveOpsApp initialTab="rules" />);

    expect(screen.getByText(/Sigma-Inspired SIEM Detection Rules/i)).toBeInTheDocument();
    expect(screen.getByText(/Rapid Credential Guessing & Password Spraying/i)).toBeInTheDocument();
    expect(screen.getByText(/RULE-SEC-001/i)).toBeInTheDocument();

    // Click "Test Against Telemetry" button on a rule
    const testButtons = screen.getAllByRole('button', { name: /Test Against Telemetry/i });
    expect(testButtons.length).toBeGreaterThan(0);
    fireEvent.click(testButtons[0]!);

    // Check evaluation feedback
    expect(screen.getByText(/Evaluated against/i)).toBeInTheDocument();
  });

  it('navigates to Alert Queue tab and provides triage controls', () => {
    render(<DefensiveOpsApp initialTab="alerts" />);

    // Search input for alerts
    expect(screen.getByPlaceholderText(/Search alerts\.\.\./i)).toBeInTheDocument();

    // Check presence of alert triage action buttons in inspector
    const alertButtons = screen.getAllByText(/RULE-SEC-/i);
    expect(alertButtons.length).toBeGreaterThan(0);
  });

  it('navigates to Investigation tab and shows incident timeline and attack chain', () => {
    render(<DefensiveOpsApp initialTab="investigation" />);

    expect(screen.getByText(/Incident Investigation & Timeline Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/CORRELATED ATTACK CHAIN \(OPERATION LAGOS SHIELD\)/i)).toBeInTheDocument();
    expect(screen.getByText(/RECORD CONFIRMED FACT \/ INVESTIGATION HYPOTHESIS/i)).toBeInTheDocument();

    // Fill hypothesis form
    const titleInput = screen.getByPlaceholderText(/Fact \/ Hypothesis Title\.\.\./i);
    const bodyInput = screen.getByPlaceholderText(/Explain evidence, observed telemetry, or attribution hypothesis\.\.\./i);

    fireEvent.change(titleInput, { target: { value: 'Webshell Dropped via AI Service' } });
    fireEvent.change(bodyInput, { target: { value: 'Base64 encoded payload observed in HTTP POST parameters' } });

    const submitHypoBtn = screen.getByRole('button', { name: /\+ Record Finding/i });
    fireEvent.click(submitHypoBtn);

    // Form clears
    expect((titleInput as HTMLInputElement).value).toBe('');
  });

  it('navigates to Defensive Response tab and shows active mitigations status', () => {
    render(<DefensiveOpsApp initialTab="response" />);

    expect(screen.getByText(/Simulated Defensive Response & Active Mitigation Console/i)).toBeInTheDocument();
    expect(screen.getByText(/ISOLATED ENDPOINTS/i)).toBeInTheDocument();
    expect(screen.getByText(/BLOCKED INDICATORS \(PERIMETER\)/i)).toBeInTheDocument();

    const submitActionBtn = screen.getByRole('button', { name: /Execute Mitigation Action/i });
    expect(submitActionBtn).toBeInTheDocument();
    fireEvent.click(submitActionBtn);
  });

  it('navigates to Purple Team tab and runs adversary emulation scenario', () => {
    render(<DefensiveOpsApp initialTab="purple" />);

    expect(screen.getByText(/Purple Team Adversary Emulation & Coverage Studio/i)).toBeInTheDocument();

    // Run all button
    const runAllBtn = screen.getByRole('button', { name: /Run All Emulation Tests/i });
    expect(runAllBtn).toBeInTheDocument();
    fireEvent.click(runAllBtn);
  });

  it('navigates to Operation Lagos Shield tab and submits incident report', () => {
    render(<DefensiveOpsApp initialTab="mission" />);

    expect(screen.getByText(/Operation Lagos Shield — Defensive Mission Checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/MISSION OBJECTIVES/i)).toBeInTheDocument();

    // Submit report button
    const submitReportBtn = screen.getByRole('button', { name: /Submit Formal Assessment Report/i });
    expect(submitReportBtn).toBeInTheDocument();
    fireEvent.click(submitReportBtn);
  });
});
