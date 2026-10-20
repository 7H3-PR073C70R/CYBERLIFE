/**
 * Cyberlife — SecurityNewsApp Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SecurityNewsApp } from '@/presentation/desktop/apps/SecurityNewsApp';
import { SimulationContext } from '@/application/simulation/SimulationContext';
import { createInitialSimulationState } from '@/simulation/core/initialState';
import { SimulationState } from '@/simulation/core/types';

describe('SecurityNewsApp', () => {
  it('renders Orion threat dispatch header and default articles', () => {
    render(<SecurityNewsApp />);
    expect(screen.getByTestId('security-news-app')).toBeInTheDocument();
    expect(screen.getByText(/Orion THREAT DISPATCH/i)).toBeInTheDocument();
    expect(screen.getByText(/WEST AFRICA CERT FEED/i)).toBeInTheDocument();
    expect(screen.getByText(/Critical SMB RCE \(CVE-2026-445\)/i)).toBeInTheDocument();
  });

  it('filters articles by category when category pills are clicked', () => {
    render(<SecurityNewsApp />);

    // Click 'Tool Releases'
    const toolBtn = screen.getByRole('button', { name: /Tool Releases/i });
    fireEvent.click(toolBtn);

    expect(
      screen.getByText(/Orion Security Tool Release: Packet Lens 4.2/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Critical SMB RCE \(CVE-2026-445\)/i)).not.toBeInTheDocument();

    // Click 'All Feeds'
    const allBtn = screen.getByRole('button', { name: /All Feeds/i });
    fireEvent.click(allBtn);

    expect(screen.getByText(/Critical SMB RCE \(CVE-2026-445\)/i)).toBeInTheDocument();
  });

  it('filters articles by search query (e.g. searching "Aster")', () => {
    const initialState = createInitialSimulationState({
      flags: { has_accessed_workstation: true },
    });

    const mockSim = {
      state: initialState,
      dispatch: () => ({ success: true, state: initialState, events: [] }),
    };

    render(
      <SimulationContext.Provider
        value={mockSim as unknown as React.ContextType<typeof SimulationContext>}
      >
        <SecurityNewsApp />
      </SimulationContext.Provider>
    );

    const searchInput = screen.getByPlaceholderText(/Search CVE, IOCs, hosts.../i);
    fireEvent.change(searchInput, { target: { value: 'Aster' } });

    expect(
      screen.getByText(/Cedarline Services Internal Advisory: Aster AI Permissions/i)
    ).toBeInTheDocument();
  });

  it('reveals Day 2 articles dynamically when simulation state advances to Day 13', () => {
    // Initial state at Day 12
    const day12State = createInitialSimulationState({
      flags: { has_accessed_workstation: true },
    });

    const { rerender } = render(
      <SimulationContext.Provider
        value={
          {
            state: day12State,
            dispatch: () => ({ success: true, state: day12State, events: [] }),
          } as unknown as React.ContextType<typeof SimulationContext>
        }
      >
        <SecurityNewsApp />
      </SimulationContext.Provider>
    );

    expect(
      screen.queryByText(/Day 2 Threat Briefing: Multi-Factor Bypass/i)
    ).not.toBeInTheDocument();

    // Advance to Day 2 (Day 13 in calendar)
    const day13State: SimulationState = {
      ...day12State,
      time: {
        ...day12State.time,
        calendar: {
          ...day12State.time.calendar,
          day: 13,
          dateString: 'Tuesday, Oct 13, 2026',
        },
      },
    };

    rerender(
      <SimulationContext.Provider
        value={
          {
            state: day13State,
            dispatch: () => ({ success: true, state: day13State, events: [] }),
          } as unknown as React.ContextType<typeof SimulationContext>
        }
      >
        <SecurityNewsApp />
      </SimulationContext.Provider>
    );

    expect(screen.getByText(/Day 2 Threat Briefing: Multi-Factor Bypass/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Day 2 Cedarline Incident Update: Filesrv-01 SMB Query/i)
    ).toBeInTheDocument();
  });
});
