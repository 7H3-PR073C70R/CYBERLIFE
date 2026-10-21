import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { IncidentApp } from '@/presentation/desktop/apps/IncidentApp';
import { SimulationProvider } from '@/application/simulation/SimulationContext';
import { createSimulationEngine } from '@/simulation';

describe('IncidentApp Component', () => {
  it('renders incident portal header, 9-phase tracker, and default overview tab', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <IncidentApp />
      </SimulationProvider>
    );

    expect(screen.getByTestId('incident-app-container')).toBeInTheDocument();
    expect(screen.getByText(/The Aster Incident — IR Case #2026-AST-01/i)).toBeInTheDocument();
    expect(screen.getByText(/PHASE: BRIEFING/i)).toBeInTheDocument();
    expect(screen.getByTestId('phase-step-briefing')).toBeInTheDocument();
    expect(screen.getByTestId('phase-step-completed')).toBeInTheDocument();
    expect(screen.getByTestId('incident-panel-overview')).toBeInTheDocument();
  });

  it('switches navigation tabs properly', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <IncidentApp />
      </SimulationProvider>
    );

    // Switch to Briefing tab
    fireEvent.click(screen.getByTestId('incident-tab-briefing'));
    expect(screen.getByTestId('incident-panel-briefing')).toBeInTheDocument();
    expect(screen.getByText(/OFFICIAL IR BRIEFING/i)).toBeInTheDocument();
    expect(screen.getByText(/Blessing/i)).toBeInTheDocument();

    // Switch to Root-Cause tab
    fireEvent.click(screen.getByTestId('incident-tab-rootcause'));
    expect(screen.getByTestId('incident-panel-rootcause')).toBeInTheDocument();
    expect(screen.getByTestId('select-suspected-cause')).toBeInTheDocument();

    // Switch to Containment tab
    fireEvent.click(screen.getByTestId('incident-tab-containment'));
    expect(screen.getByTestId('incident-panel-containment')).toBeInTheDocument();
    expect(screen.getByTestId('aster-status-pill')).toBeInTheDocument();

    // Switch to Verification tab
    fireEvent.click(screen.getByTestId('incident-tab-verification'));
    expect(screen.getByTestId('incident-panel-verification')).toBeInTheDocument();
    expect(screen.getByTestId('btn-run-verification')).toBeInTheDocument();

    // Switch to Report tab
    fireEvent.click(screen.getByTestId('incident-tab-report'));
    expect(screen.getByTestId('incident-panel-report')).toBeInTheDocument();
    expect(screen.getByTestId('input-report-exec-summary')).toBeInTheDocument();
  });

  it('advances phase upon acknowledging the briefing', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <IncidentApp />
      </SimulationProvider>
    );

    fireEvent.click(screen.getByTestId('incident-tab-briefing'));
    const ackBtn = screen.getByTestId('btn-acknowledge-briefing');
    expect(ackBtn).toBeInTheDocument();

    act(() => {
      fireEvent.click(ackBtn);
    });

    expect(screen.getByText(/PHASE: INITIAL ASSESSMENT/i)).toBeInTheDocument();
  });

  it('submits a root-cause assessment and displays validation feedback', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <IncidentApp />
      </SimulationProvider>
    );

    fireEvent.click(screen.getByTestId('incident-tab-rootcause'));

    act(() => {
      fireEvent.click(screen.getByTestId('btn-submit-assessment'));
    });

    expect(screen.getByTestId('assessment-feedback-box')).toBeInTheDocument();
    expect(screen.getByText(/Assessment Accepted/i)).toBeInTheDocument();
  });

  it('handles containment, remediation, and verification workflows', () => {
    const engine = createSimulationEngine();

    // Advance to containment phase
    act(() => {
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'initial_assessment' });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'investigation' });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'evidence_preservation' });
      engine.dispatch({
        type: 'PreserveMissionEvidence',
        evidenceId: 'EVD-2026-004',
        source: 'app-portal-01',
        description: 'IAM Manifest',
        reason: 'Snapshot',
      });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'containment' });
    });

    render(
      <SimulationProvider engine={engine}>
        <IncidentApp />
      </SimulationProvider>
    );

    fireEvent.click(screen.getByTestId('incident-tab-containment'));

    // Execute containment
    const containBtn = screen.getByTestId('btn-execute-containment');
    act(() => {
      fireEvent.click(containBtn);
    });

    expect(screen.getByText(/Containment Active/i)).toBeInTheDocument();

    // Advance to remediation and execute remediation
    act(() => {
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'remediation' });
    });

    const remediateBtn = screen.getByTestId('btn-execute-remediation');
    act(() => {
      fireEvent.click(remediateBtn);
    });

    expect(screen.getByText(/Least-Privilege Policy Applied/i)).toBeInTheDocument();

    // Switch to verification tab and run verification
    fireEvent.click(screen.getByTestId('incident-tab-verification'));
    act(() => {
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'verification' });
      fireEvent.click(screen.getByTestId('btn-run-verification'));
    });

    expect(screen.getByTestId('verification-results-container')).toBeInTheDocument();
    expect(screen.getByText(/VERIFICATION PASSED/i)).toBeInTheDocument();
  });

  it('populates findings, submits incident report, and completes mission', () => {
    const engine = createSimulationEngine();

    // Set up state in reporting phase
    act(() => {
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'initial_assessment' });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'investigation' });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'evidence_preservation' });
      engine.dispatch({
        type: 'PreserveMissionEvidence',
        evidenceId: 'EVD-2026-004',
        source: 'app-portal-01',
        description: 'IAM Manifest',
        reason: 'Pre-remediation',
      });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'containment' });
      engine.dispatch({
        type: 'ExecuteContainment',
        action: 'isolate_service',
        reason: 'Isolate Aster',
      });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'remediation' });
      engine.dispatch({
        type: 'RemediatePermissions',
        targetPolicyRole: 'kb-assistant',
        removeSmbAccess: true,
        removeDatabaseAccess: true,
        grantedScopes: ['docs:read', 'kb:search'],
      });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'verification' });
      engine.dispatch({ type: 'VerifyRemediation' });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'reporting' });
    });

    render(
      <SimulationProvider engine={engine}>
        <IncidentApp />
      </SimulationProvider>
    );

    fireEvent.click(screen.getByTestId('incident-tab-report'));

    // Test populate findings button
    fireEvent.click(screen.getByTestId('btn-autopopulate-report'));
    expect(
      (screen.getByTestId('input-report-exec-summary') as HTMLTextAreaElement).value
    ).toContain('Cedarline Services Incident Response');

    // Submit report
    act(() => {
      fireEvent.click(screen.getByTestId('btn-submit-report'));
    });

    expect(screen.getByTestId('report-feedback-box')).toBeInTheDocument();
    expect(screen.getAllByText(/Report Approved/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId('mission-debrief-card')).toBeInTheDocument();
    expect(screen.getByText(/MISSION ACCOMPLISHED/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Principle of Least Privilege/i).length).toBeGreaterThan(0);
  });

  it('renders command copy chips in overview and allows copying incident report to clipboard', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <IncidentApp />
      </SimulationProvider>
    );

    // Overview tab should render command copy chips for objectives
    expect(screen.getByTestId('command-chip-netmap_hosts')).toBeInTheDocument();
    expect(screen.getByTestId('command-chip-svcscan_inspect_app_portal_01')).toBeInTheDocument();

    // Switch to Report tab
    fireEvent.click(screen.getByTestId('incident-tab-report'));

    const copyReportBtn = screen.getByTestId('btn-copy-report-draft');
    expect(copyReportBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(copyReportBtn);
    });

    expect(writeTextMock).toHaveBeenCalled();
    const copiedText = writeTextMock.mock.calls[0]![0];
    expect(copiedText).toContain('Case ID: IR Case #2026-AST-01');
    expect(screen.getByText(/Copied Report Draft/i)).toBeInTheDocument();
  });
});
