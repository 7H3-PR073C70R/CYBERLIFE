import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TerminalApp } from '@/presentation/desktop/apps/TerminalApp';
import { SimulationProvider } from '@/application/simulation/SimulationContext';

describe('TerminalApp Component', () => {
  it('renders initial terminal prompt, chips, and welcome greeting', () => {
    render(
      <SimulationProvider>
        <TerminalApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    expect(screen.getByTestId('terminal-app-container')).toBeInTheDocument();
    expect(screen.getByText(/Heron OS/i)).toBeInTheDocument();
    expect(screen.getByTestId('terminal-command-input')).toBeInTheDocument();
    expect(screen.getByTestId('terminal-chip-help')).toBeInTheDocument();
    expect(screen.getByTestId('terminal-chip-netmap')).toBeInTheDocument();
    expect(screen.getByTestId('terminal-chip-svcscan')).toBeInTheDocument();
    expect(screen.getByTestId('terminal-chip-logview')).toBeInTheDocument();
    expect(screen.getByTestId('terminal-chip-evidence')).toBeInTheDocument();
    expect(screen.getByTestId('terminal-chip-whoami')).toBeInTheDocument();
    expect(screen.getByTestId('terminal-chip-date')).toBeInTheDocument();
    expect(screen.getByTestId('terminal-chip-status')).toBeInTheDocument();
  });

  it('submits a command on Enter and displays formatted output', () => {
    render(
      <SimulationProvider>
        <TerminalApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    const input = screen.getByTestId('terminal-command-input');
    fireEvent.change(input, { target: { value: 'whoami' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('tade_adebayo')).toBeInTheDocument();
    expect(screen.getByText(/Security Analyst Intern/i)).toBeInTheDocument();
  });

  it('displays in-game simulation time when running date command', () => {
    render(
      <SimulationProvider>
        <TerminalApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    const input = screen.getByTestId('terminal-command-input');
    fireEvent.change(input, { target: { value: 'date' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/Monday, Oct 12, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Authoritative Cyberlife Simulation Engine/i)).toBeInTheDocument();
  });

  it('displays workstation status when running status command', () => {
    render(
      <SimulationProvider>
        <TerminalApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    const input = screen.getByTestId('terminal-command-input');
    fireEvent.change(input, { target: { value: 'status' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/cedarline-sec-ws04.corp.local/i)).toBeInTheDocument();
    expect(screen.getByText(/Heron OS v4.5/i)).toBeInTheDocument();
    expect(screen.getByText(/100% synthetic in-game sandbox/i)).toBeInTheDocument();
  });

  it('navigates command history with ArrowUp and ArrowDown keys', () => {
    render(
      <SimulationProvider>
        <TerminalApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    const input = screen.getByTestId('terminal-command-input') as HTMLInputElement;

    // Run first command
    fireEvent.change(input, { target: { value: 'whoami' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Run second command
    fireEvent.change(input, { target: { value: 'date' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // ArrowUp recalls last command ('date')
    fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
    expect(input.value).toBe('date');

    // ArrowUp again recalls earlier command ('whoami')
    fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
    expect(input.value).toBe('whoami');

    // ArrowDown goes forward to 'date'
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(input.value).toBe('date');

    // ArrowDown again returns to empty buffer
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(input.value).toBe('');
  });

  it('displays guidance card and requires manual typing when clicking command guide chips without auto-filling input', () => {
    render(
      <SimulationProvider>
        <TerminalApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    const input = screen.getByTestId('terminal-command-input') as HTMLInputElement;
    const statusChip = screen.getByTestId('terminal-chip-status');

    fireEvent.click(statusChip);
    // Mandatory manual typing: command chips must NOT auto-fill input
    expect(input.value).toBe('');
    // Instead, educational guidance card is displayed
    expect(screen.getByTestId('terminal-hint-banner')).toBeInTheDocument();
    expect(screen.getByText(/Queries the synthetic workstation hostname/i)).toBeInTheDocument();
    expect(screen.getByText(/Manual Typing:/i)).toBeInTheDocument();
  });

  it('clears screen output when Clear Screen button is clicked', () => {
    render(
      <SimulationProvider>
        <TerminalApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    // Initial greeting is present
    expect(screen.getByText(/Heron OS/i)).toBeInTheDocument();

    const clearBtn = screen.getByTestId('btn-terminal-clear');
    fireEvent.click(clearBtn);

    // Screen should now be cleared
    expect(screen.queryByText(/Heron OS/i)).not.toBeInTheDocument();
  });

  it('isolates keyboard events by stopping propagation', () => {
    const parentHandler = vi.fn();

    render(
      <div onKeyDown={parentHandler}>
        <SimulationProvider>
          <TerminalApp workstationId="interact_cedarline_workstation" />
        </SimulationProvider>
      </div>
    );

    const input = screen.getByTestId('terminal-command-input');
    fireEvent.keyDown(input, {
      key: 'w',
      code: 'KeyW',
    });

    expect(parentHandler).not.toHaveBeenCalled();
  });

  it('triggers onTyping and onTerminalOutput callbacks', () => {
    const onTyping = vi.fn();
    const onTerminalOutput = vi.fn();

    render(
      <SimulationProvider>
        <TerminalApp
          workstationId="interact_cedarline_workstation"
          onTyping={onTyping}
          onTerminalOutput={onTerminalOutput}
        />
      </SimulationProvider>
    );

    const input = screen.getByTestId('terminal-command-input');
    fireEvent.change(input, { target: { value: 'h' } });
    expect(onTyping).toHaveBeenCalled();

    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(onTerminalOutput).toHaveBeenCalled();
  });

  it('executes netmap hosts and displays discovered subnet inventory', () => {
    render(
      <SimulationProvider>
        <TerminalApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    const input = screen.getByTestId('terminal-command-input');
    fireEvent.change(input, { target: { value: 'netmap hosts' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/DISCOVERED SUBNET HOST INVENTORY/i)).toBeInTheDocument();
    expect(screen.getByText(/filesrv-01/i)).toBeInTheDocument();
  });

  it('shows educational guidance card for netmap without auto-filling input', () => {
    render(
      <SimulationProvider>
        <TerminalApp workstationId="interact_cedarline_workstation" />
      </SimulationProvider>
    );

    const input = screen.getByTestId('terminal-command-input') as HTMLInputElement;
    const netmapChip = screen.getByTestId('terminal-chip-netmap');

    fireEvent.click(netmapChip);
    expect(input.value).toBe('');
    expect(screen.getByTestId('terminal-hint-banner')).toBeInTheDocument();
    expect(screen.getByText(/Discovers reachable virtual hosts/i)).toBeInTheDocument();
    expect(screen.getByText(/Manual Typing:/i)).toBeInTheDocument();
  });
});
