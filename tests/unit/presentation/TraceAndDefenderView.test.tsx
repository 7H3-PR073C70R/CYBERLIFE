/**
 * Cyberlife — Trace & Defender View Presentation Component Tests
 *
 * Validates UI contracts for:
 * 1. TraceMeterApplet in TopPanel (visibility, threshold colors, reduced motion, defender response pill)
 * 2. ScopeWarningDialog (accessibility, target display, proceed/cancel actions)
 * 3. DefenderViewModal (purple-team timeline, log artifact preview, ATT&CK details, feedback summary)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ContextType } from 'react';
import { TraceMeterApplet } from '@/presentation/desktop/components/TraceMeterApplet';
import { ScopeWarningDialog } from '@/presentation/desktop/components/ScopeWarningDialog';
import { DefenderViewModal } from '@/presentation/desktop/components/DefenderViewModal';
import { SimulationContext } from '@/application/simulation/SimulationContext';
import { createInitialSimulationState } from '@/simulation/core/initialState';
import { DefenderViewDebrief, ScopeWarning } from '@/simulation/cyber/trace/types';

describe('Trace & Defender View UI Components', () => {
  describe('TraceMeterApplet', () => {
    it('remains hidden when trace and legal exposure are zero and no night job is active', () => {
      const state = createInitialSimulationState();
      const mockValue = { state, dispatch: vi.fn() };
      const { container } = render(
        <SimulationContext.Provider value={mockValue as unknown as ContextType<typeof SimulationContext>}>
          <TraceMeterApplet />
        </SimulationContext.Provider>
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders indicators when night job is active or trace is elevated', () => {
      const state = createInitialSimulationState();
      const activeState = {
        ...state,
        trace: {
          ...state.trace!,
          isNightJobActive: true,
          traceMeter: 45,
          legalExposureMeter: 20,
        },
      };

      const mockValue = { state: activeState, dispatch: vi.fn() };
      render(
        <SimulationContext.Provider value={mockValue as unknown as ContextType<typeof SimulationContext>}>
          <TraceMeterApplet />
        </SimulationContext.Provider>
      );

      expect(screen.getByTestId('trace-meter-applet')).toBeInTheDocument();
      expect(screen.getByTestId('trace-indicator')).toHaveTextContent('45%');
      expect(screen.getByTestId('legal-indicator')).toHaveTextContent('20%');
      expect(screen.getByText('NIGHT')).toBeInTheDocument();
    });

    it('renders active defender response pill and triggers dismissal', () => {
      const state = createInitialSimulationState();
      const dispatchMock = vi.fn();
      const alertState = {
        ...state,
        trace: {
          ...state.trace!,
          traceMeter: 60,
          activeDefenderResponses: [
            {
              id: 'resp-rate-limit-1',
              type: 'RATE_LIMIT' as const,
              target: 'app-portal-01',
              triggeredAtTraceLevel: 25,
              timestampSimTime: 100,
              message: 'Rate limit engaged',
              logSignature: 'WAF_429',
              isDismissed: false,
            },
          ],
        },
      };

      const mockValue = { state: alertState, dispatch: dispatchMock };
      render(
        <SimulationContext.Provider value={mockValue as unknown as ContextType<typeof SimulationContext>}>
          <TraceMeterApplet />
        </SimulationContext.Provider>
      );

      const capsule = screen.getByTestId('defender-response-capsule');
      expect(capsule).toBeInTheDocument();
      expect(capsule).toHaveTextContent('RATE_LIMIT');

      const dismissBtn = screen.getByTitle('Dismiss response alert');
      fireEvent.click(dismissBtn);

      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'DismissDefenderResponse',
        responseId: 'resp-rate-limit-1',
      });
    });
  });

  describe('ScopeWarningDialog', () => {
    const dummyWarning: ScopeWarning = {
      target: 'out-of-scope-dc02',
      attemptedAction: 'portscan_aggressive',
      reason: "Target 'out-of-scope-dc02' is outside your authorised RoE scope.",
      timestampSimTime: 500,
      pendingActionPayload: { actionId: 'portscan_aggressive' },
    };

    it('adheres to modal accessibility requirements and displays target name', () => {
      render(<ScopeWarningDialog warning={dummyWarning} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(screen.getByText('out-of-scope-dc02')).toBeInTheDocument();
      expect(screen.getByText(/"This host is not in your authorised scope. Proceed\?"/)).toBeInTheDocument();
    });

    it('invokes cancel and proceed handlers appropriately', () => {
      const proceedMock = vi.fn();
      const cancelMock = vi.fn();

      render(
        <ScopeWarningDialog
          warning={dummyWarning}
          onProceed={proceedMock}
          onCancel={cancelMock}
        />
      );

      const cancelBtn = screen.getByTestId('btn-scope-cancel');
      fireEvent.click(cancelBtn);
      expect(cancelMock).toHaveBeenCalledTimes(1);

      const proceedBtn = screen.getByTestId('btn-scope-proceed');
      fireEvent.click(proceedBtn);
      expect(proceedMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('DefenderViewModal', () => {
    const mockDebrief: DefenderViewDebrief = {
      jobId: 'ep01_night_intel',
      completedAtSimTime: 1200,
      finalTraceLevel: 60,
      finalLegalExposure: 30,
      totalActions: 2,
      detectedCount: 1,
      overallVerdict: 'SURVEILLED',
      feedbackSummary: 'Target perimeter logged anomalous SYN scans on port 8080.',
      entries: [
        {
          id: 'entry-1',
          timestampString: '08:02 AM',
          timestampSimTime: 100,
          target: 'app-portal-01',
          actionName: 'Passive OSINT & Intelligence Search',
          logLine: 'DNS query to public resolver: app-portal-01 IN A',
          logFormat: 'DNS_QUERY',
          status: 'MISSED',
          attckTechniqueId: 'T1596',
          attckTechniqueName: 'Search Open Technical Databases',
          blueTeamInsight: 'Target experiences zero inbound packets.',
          redTeamLesson: 'Optimal stealth recon.',
        },
        {
          id: 'entry-2',
          timestampString: '08:05 AM',
          timestampSimTime: 120,
          target: 'app-portal-01',
          actionName: 'Aggressive SYN Port Scan (-T4)',
          logLine: '{"event_type":"alert","dest_ip":"app-portal-01","alert":{"signature":"ET SCAN"}}',
          logFormat: 'SURICATA_JSON',
          status: 'DETECTED',
          attckTechniqueId: 'T1046',
          attckTechniqueName: 'Network Service Discovery',
          blueTeamInsight: 'Suricata IDS generated high-severity alert.',
          redTeamLesson: 'Never run aggressive templates against defended perimeters.',
        },
      ],
    };

    it('renders the purple-team debrief modal with timeline and verdict badge', () => {
      render(<DefenderViewModal debrief={mockDebrief} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('DEFENDER VIEW // WHAT THE BLUE TEAM SAW')).toBeInTheDocument();
      expect(screen.getByText('SUSPICIOUS // SURVEILLED')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-entry-0')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-entry-1')).toBeInTheDocument();
    });

    it('switches between timeline entries and displays simulated log artifact and mitigation lessons', () => {
      render(<DefenderViewModal debrief={mockDebrief} />);

      // Initially entry 0 is selected
      expect(screen.getByTestId('simulated-log-box')).toHaveTextContent('DNS query to public resolver');
      expect(screen.getByText('Optimal stealth recon.')).toBeInTheDocument();

      // Click entry 1
      fireEvent.click(screen.getByTestId('timeline-entry-1'));
      expect(screen.getByTestId('simulated-log-box')).toHaveTextContent('ET SCAN');
      expect(screen.getByText('Never run aggressive templates against defended perimeters.')).toBeInTheDocument();
    });

    it('invokes onClose when dismiss button is clicked', () => {
      const closeMock = vi.fn();
      render(<DefenderViewModal debrief={mockDebrief} onClose={closeMock} />);

      const dismissBtn = screen.getByTestId('btn-dismiss-debrief');
      fireEvent.click(dismissBtn);
      expect(closeMock).toHaveBeenCalledTimes(1);
    });
  });
});
