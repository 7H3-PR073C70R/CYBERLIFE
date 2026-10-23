/**
 * Cyberlife — Enterprise Debrief Modal Component Tests
 *
 * Verifies:
 * 1. Renders debrief modal with NIST SP 800-61r2 lifecycle review and ATT&CK mapping.
 * 2. Displays grade and score accurately.
 * 3. Shows correct findings and study topics.
 * 4. Calls dispatch on acknowledgment.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EnterpriseDebriefModal } from '../../../../src/presentation/desktop/components/EnterpriseDebriefModal';
import { SimulationContext } from '../../../../src/application/simulation';
import { createInitialSimulationState } from '../../../../src/simulation/core/initialState';
import { SimulationState } from '../../../../src/simulation/core/types';
import type { SimulationEngine } from '../../../../src/simulation';

describe('EnterpriseDebriefModal Component', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <EnterpriseDebriefModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders educational findings, ATT&CK techniques, and SANS syllabus when open', () => {
    const base = createInitialSimulationState();
    const mockState: SimulationState = {
      ...base,
      flags: {
        ...base.flags,
        flag_m16_objective_smb_filtered: true,
        'flag_evidence_preserved_EVD-2026-004': true,
        'flag_evidence_preserved_EVD-2026-001': true,
        flag_aster_contained: true,
        flag_aster_remediated: true,
        flag_aster_verified: true,
        flag_ep01_choice_escalate: true,
      },
    };

    const mockDispatch = vi.fn();

    render(
      <SimulationContext.Provider
        value={{
          state: mockState,
          dispatch: mockDispatch,
          engine: {} as unknown as SimulationEngine,
          lastEvents: [],
        }}
      >
        <EnterpriseDebriefModal isOpen={true} onClose={vi.fn()} />
      </SimulationContext.Provider>
    );

    expect(screen.getByText(/SecOps Incident Debrief/i)).toBeInTheDocument();
    expect(screen.getByText(/Ticket ALT-2026-1012/i)).toBeInTheDocument();
    expect(screen.getByText(/100/i)).toBeInTheDocument();
    expect(screen.getByText(/NIST SP 800-61 Rev. 2/i)).toBeInTheDocument();
    expect(screen.getByText(/T1021.002: Remote Services/i)).toBeInTheDocument();
    expect(screen.getByText(/T1071.001: Command and Control/i)).toBeInTheDocument();
    expect(screen.getByText(/SANS SEC503/i)).toBeInTheDocument();
  });

  it('dispatches beat completion and closes when acknowledgment button is clicked', () => {
    const base = createInitialSimulationState();
    const mockState: SimulationState = {
      ...base,
      episode: {
        ...(base.episode ?? {
          activeEpisodeId: null,
          activeBeatId: null,
          completedBeatIds: [],
          completedEpisodeIds: [],
          unlockedJournalEntryIds: [],
          activeTickets: [],
          deliveredMessages: [],
          guidanceMode: 'Guided' as const,
          activeBlackout: null,
          activeTitleCard: null,
          activeChoice: null,
          activeCall: null,
          mentorHintsDelivered: [],
        }),
        activeEpisodeId: 'ep01_triage_init',
        activeBeatId: 'ep01_beat_09_day_debrief',
      },
    };

    const mockDispatch = vi.fn();
    const mockOnClose = vi.fn();

    render(
      <SimulationContext.Provider
        value={{
          state: mockState,
          dispatch: mockDispatch,
          engine: {} as unknown as SimulationEngine,
          lastEvents: [],
        }}
      >
        <EnterpriseDebriefModal isOpen={true} onClose={mockOnClose} />
      </SimulationContext.Provider>
    );

    const ackBtn = screen.getByTestId('debrief-acknowledge-btn');
    fireEvent.click(ackBtn);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'CompleteEpisodeBeat',
      beatId: 'ep01_beat_09_day_debrief',
    });
    expect(mockOnClose).toHaveBeenCalled();
  });
});
