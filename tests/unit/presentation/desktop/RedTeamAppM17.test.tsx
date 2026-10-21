/**
 * Cyberlife — Milestone 17: Red Team Application Presentation Unit Tests
 *
 * Tests the interactive desktop assessment workspace:
 * - Header rendering & 6 primary navigation tabs
 * - Briefing & Scope: Rules of Engagement signing and authorization unlocking
 * - Target Inventory: Visual distinction between authorized and prohibited assets
 * - Assessment Console: In-scope tool execution vs out-of-scope authorization denial
 * - Findings Studio: True-positive validation and false-positive rejection
 * - Evidence Vault: Cryptographic provenance display and analyst notes
 * - Executive Report: Deliverable generation and CISO evaluation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RedTeamApp } from '@/presentation/desktop/apps/RedTeamApp';

describe('RedTeamApp (Milestone 17 Presentation Suite)', () => {
  beforeEach(() => {
    // Reset window.location.search before each test
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/');
    }
  });

  it('renders application header and all 6 navigation tabs', () => {
    render(<RedTeamApp />);

    expect(screen.getAllByText(/Operation Eko Citadel/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ROE-2026-CEDAR-RED-01/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/UNAUTHORIZED \(ROE PENDING\)/i)).toBeInTheDocument();

    // Verify 6 primary navigation tabs
    expect(screen.getByRole('button', { name: /1\. Briefing & Scope/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /2\. Target Inventory/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3\. Assessment Console/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /4\. Findings Studio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /5\. Evidence Vault/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /6\. Report & Evaluation/i })).toBeInTheDocument();
  });

  it('signs and accepts Rules of Engagement on Scope tab', () => {
    render(<RedTeamApp initialTab="scope" />);

    // Initial state: RoE pending acceptance
    expect(screen.getByText(/UNAUTHORIZED \(ROE PENDING\)/i)).toBeInTheDocument();

    const signButton = screen.getByTestId('btn-accept-roe');
    expect(signButton).toBeInTheDocument();
    expect(signButton).toHaveTextContent(/Confirm & Sign RoE/i);

    fireEvent.click(signButton);

    // After signing, state updates to ACTIVE
    expect(screen.getByText(/✓ Rules of Engagement Accepted/i)).toBeInTheDocument();
  });

  it('displays in-scope and out-of-scope targets in Target Inventory tab', () => {
    render(<RedTeamApp initialTab="targets" />);

    // In-scope target cards
    expect(screen.getByText('app-portal-01')).toBeInTheDocument();
    expect(screen.getByText('filesrv-01')).toBeInTheDocument();
    expect(screen.getByText('api-gw-01')).toBeInTheDocument();
    expect(screen.getByText('web-quote-01')).toBeInTheDocument();

    // Out-of-scope boundary targets
    expect(screen.getByText('dc-core-01')).toBeInTheDocument();
    expect(screen.getByText('mon-siem-01')).toBeInTheDocument();
    expect(screen.getAllByText(/OUT-OF-SCOPE/i).length).toBeGreaterThan(0);
  });

  it('enforces authorization gate and displays denial on out-of-scope target in Console tab', () => {
    render(<RedTeamApp initialTab="scope" />);

    // First accept RoE
    fireEvent.click(screen.getByTestId('btn-accept-roe'));

    // Switch to Console
    fireEvent.click(screen.getByTestId('tab-console'));

    // Select out-of-scope target dc-core-01
    const targetSelect = screen.getByLabelText(/Target Asset:/i);
    fireEvent.change(targetSelect, { target: { value: 'dc-core-01' } });

    // Execute tool
    const executeBtn = screen.getByTestId('btn-execute-action');
    fireEvent.click(executeBtn);

    // Denial feedback should be displayed
    expect(screen.getByText(/AUTHORIZATION DENIED/i)).toBeInTheDocument();
    expect(screen.getByText(/OUT OF SCOPE/i)).toBeInTheDocument();
  });

  it('triages findings on Findings Studio tab', () => {
    render(<RedTeamApp initialTab="findings" />);

    expect(screen.getAllByText(/VULN-CEDAR-001/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Broken Object-Level Authorization/i).length).toBeGreaterThan(0);

    // Validate button
    const validateBtn = screen.getByTestId('btn-validate-finding');
    expect(validateBtn).toBeInTheDocument();
    fireEvent.click(validateBtn);

    expect(screen.getByText(/updated with status: VALIDATED/i)).toBeInTheDocument();
  });

  it('displays evidence with SHA-256 hashes and supports analyst note entry on Evidence tab', () => {
    render(<RedTeamApp initialTab="evidence" />);

    expect(screen.getByText(/Forensic Evidence Vault/i)).toBeInTheDocument();
    expect(screen.getAllByText(/SHA-256/i).length).toBeGreaterThan(0);

    // Form inputs for analyst note
    const titleInput = screen.getByPlaceholderText(/Note Title \/ Subject/i);
    const contentInput = screen.getByPlaceholderText(/Enter analytical observation/i);
    const addNoteBtn = screen.getByRole('button', { name: /Save Analyst Note/i });

    fireEvent.change(titleInput, { target: { value: 'Verified Perimeter Exposure' } });
    fireEvent.change(contentInput, { target: { value: 'Initial passive reconnaissance correlates with M16 host map.' } });
    fireEvent.click(addNoteBtn);

    expect(screen.getByText(/Analyst note recorded into assessment audit trail/i)).toBeInTheDocument();
  });

  it('submits assessment report and displays CISO evaluation on Executive Report tab', () => {
    render(<RedTeamApp initialTab="report" />);

    expect(screen.getByText(/Executive Penetration Testing Report Deliverable/i)).toBeInTheDocument();

    const submitBtn = screen.getByTestId('btn-submit-report');
    expect(submitBtn).toBeInTheDocument();
    fireEvent.click(submitBtn);

    expect(screen.getByText(/CISO Technical Evaluation & Assessment Sign-off/i)).toBeInTheDocument();
    expect(screen.getByText(/100%/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Folake Davies/i).length).toBeGreaterThan(0);
  });
});
