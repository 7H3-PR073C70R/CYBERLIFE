import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CommandCopyChip } from '@/presentation/desktop/components/CommandCopyChip';
import { TerminalApp } from '@/presentation/desktop/apps/TerminalApp';
import { DesktopShell } from '@/presentation/desktop/DesktopShell';
import { SimulationProvider } from '@/application/simulation/SimulationContext';
import { createSimulationEngine } from '@/simulation';

describe('CommandCopyChip & Incident Terminal Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders command text, optional label, and guidance description', () => {
    render(
      <CommandCopyChip
        command="netmap hosts"
        label="Host Discovery"
        description="Scan corporate subnet for active nodes"
      />
    );

    expect(screen.getByText('Host Discovery')).toBeInTheDocument();
    expect(screen.getByText('netmap hosts')).toBeInTheDocument();
    expect(screen.getByText('Scan corporate subnet for active nodes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy command netmap hosts/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Paste command netmap hosts in Terminal/i })).toBeInTheDocument();
  });

  it('copies command to clipboard and provides visual feedback', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<CommandCopyChip command="svcscan inspect app-portal-01" />);

    const copyBtn = screen.getByRole('button', { name: /Copy command svcscan inspect app-portal-01/i });
    expect(copyBtn).toHaveTextContent('📋 Copy');

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith('svcscan inspect app-portal-01');
    expect(copyBtn).toHaveTextContent('✓ Copied');
  });

  it('dispatches open-app and terminal paste events on clicking Paste in Terminal', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const openAppListener = vi.fn();
    const pasteListener = vi.fn();

    window.addEventListener('cyberlife:desktop:open-app', openAppListener);
    window.addEventListener('cyberlife:terminal:paste', pasteListener);

    render(<CommandCopyChip command="logview recent" />);

    const pasteBtn = screen.getByRole('button', { name: /Paste command logview recent in Terminal/i });
    expect(pasteBtn).toHaveTextContent('▶ Paste in Terminal');

    act(() => {
      fireEvent.click(pasteBtn);
    });

    expect(pasteBtn).toHaveTextContent('✓ Pasted!');
    expect(openAppListener).toHaveBeenCalled();
    expect(pasteListener).toHaveBeenCalled();

    const customEventDetail = (pasteListener.mock.calls[0]![0] as CustomEvent).detail;
    expect(customEventDetail).toEqual({ command: 'logview recent', execute: false });

    window.removeEventListener('cyberlife:desktop:open-app', openAppListener);
    window.removeEventListener('cyberlife:terminal:paste', pasteListener);
  });

  it('TerminalApp listens to cyberlife:terminal:paste event and populates the input', () => {
    render(
      <SimulationProvider>
        <TerminalApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    const input = screen.getByTestId('terminal-command-input') as HTMLInputElement;
    expect(input.value).toBe('');

    act(() => {
      window.dispatchEvent(
        new CustomEvent('cyberlife:terminal:paste', {
          detail: { command: 'aster-admin contain', execute: false },
        })
      );
    });

    expect(input.value).toBe('aster-admin contain');
  });

  it('DesktopShell renders active incident SOC dispatch banner when mission is active', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <DesktopShell workstationId="interact_cedarline_workstation" onExitDesktop={() => {}} />
      </SimulationProvider>
    );

    expect(screen.getByTestId('desktop-incident-banner')).toBeInTheDocument();
    expect(screen.getByText(/ACTIVE SOC DISPATCH \/\/ The Aster Incident/i)).toBeInTheDocument();
    expect(screen.getByTestId('btn-banner-open-incident')).toBeInTheDocument();

    // Clicking banner opens the incident window
    act(() => {
      fireEvent.click(screen.getByTestId('btn-banner-open-incident'));
    });

    expect(screen.getByTestId('incident-app-container')).toBeInTheDocument();
  });
});
