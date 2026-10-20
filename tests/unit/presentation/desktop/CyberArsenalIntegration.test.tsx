/**
 * Cyberlife — Milestone 13: Cyber Arsenal UI Integration Component Tests
 *
 * Verifies the CyberCatalogueApp & CyberArsenalView integration:
 * - Tab switching between Modules & Exercises and Cyber Arsenal
 * - Tool search and filtering by Team Track and Capability Status
 * - Honest capability badge rendering (PLAYABLE, PARTIAL, REFERENCE ONLY, PLANNED)
 * - Detail inspection: learning objectives, prerequisites, limitations, command syntax
 * - Tool launch action routing to desktop window manager (onOpenApp)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CyberCatalogueApp } from '@/presentation/desktop/apps/CyberCatalogueApp';
import { SimulationProvider } from '@/application/simulation/SimulationContext';

describe('CyberCatalogueApp & CyberArsenalView Integration', () => {
  it('renders mode switch tabs and defaults to Learning Modules', () => {
    render(
      <SimulationProvider>
        <CyberCatalogueApp />
      </SimulationProvider>
    );

    expect(screen.getByTestId('tab-catalogue-modules')).toBeInTheDocument();
    expect(screen.getByTestId('tab-catalogue-arsenal')).toBeInTheDocument();

    // In default modules mode, All Tracks and course entries are visible
    expect(screen.getByRole('button', { name: /All Tracks/i })).toBeInTheDocument();
  });

  it('switches to Cybersecurity Arsenal view when clicking the Arsenal tab', () => {
    render(
      <SimulationProvider>
        <CyberCatalogueApp />
      </SimulationProvider>
    );

    const arsenalTab = screen.getByTestId('tab-catalogue-arsenal');
    fireEvent.click(arsenalTab);

    // Arsenal search and status filter should now be visible
    expect(screen.getByTestId('arsenal-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('arsenal-status-filter')).toBeInTheDocument();
    expect(screen.getByText(/Overview & Architecture/i)).toBeInTheDocument();
  });

  it('filters arsenal tools by text search query', () => {
    render(
      <SimulationProvider>
        <CyberCatalogueApp initialMode="arsenal" />
      </SimulationProvider>
    );

    const searchInput = screen.getByTestId('arsenal-search-input');
    fireEvent.change(searchInput, { target: { value: 'Wireshark' } });

    // Packet Lens should appear in the results list
    expect(screen.getByTestId('tool-item-tool_packet_lens')).toBeInTheDocument();
  });

  it('filters arsenal tools by status (e.g. Playable vs Partial)', () => {
    render(
      <SimulationProvider>
        <CyberCatalogueApp initialMode="arsenal" />
      </SimulationProvider>
    );

    const statusFilter = screen.getByTestId('arsenal-status-filter');
    fireEvent.change(statusFilter, { target: { value: 'playable' } });

    expect(screen.getByTestId('tool-item-tool_netmap')).toBeInTheDocument();
    expect(screen.getByTestId('tool-item-tool_svcscan')).toBeInTheDocument();
    expect(screen.queryByTestId('tool-item-tool_packet_lens')).not.toBeInTheDocument();

    // Now switch to partial
    fireEvent.change(statusFilter, { target: { value: 'partial' } });
    expect(screen.getByTestId('tool-item-tool_packet_lens')).toBeInTheDocument();
    expect(screen.getByTestId('tool-item-tool_rev_lens')).toBeInTheDocument();
    expect(screen.queryByTestId('tool-item-tool_netmap')).not.toBeInTheDocument();
  });

  it('inspects learning objectives, prerequisites, and command specs of selected tool', () => {
    render(
      <SimulationProvider>
        <CyberCatalogueApp initialMode="arsenal" />
      </SimulationProvider>
    );

    // Click on SvcScan
    const svcscanItem = screen.getByTestId('tool-item-tool_svcscan');
    fireEvent.click(svcscanItem);

    // Inspect selected detail pane
    expect(screen.getByTestId('selected-tool-name')).toHaveTextContent(/SvcScan/i);
    expect(screen.getByText(/Educational Objectives \(Bloom's Taxonomy\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Prerequisites & Access Clearance/i)).toBeInTheDocument();
    expect(screen.getByText(/Terminal Command Specification/i)).toBeInTheDocument();
    expect(screen.getByText(/\$ svcscan \[options\] <target>/i)).toBeInTheDocument();
  });

  it('displays honest simulation boundaries and limitations for partial tools', () => {
    render(
      <SimulationProvider>
        <CyberCatalogueApp initialMode="arsenal" />
      </SimulationProvider>
    );

    // Select Packet Lens
    const packetLensItem = screen.getByTestId('tool-item-tool_packet_lens');
    fireEvent.click(packetLensItem);

    // Status badge must show PARTIAL
    expect(screen.getByTestId('selected-tool-status-badge')).toHaveTextContent(/PARTIAL/i);
    expect(screen.getByText(/Simulation Boundaries & Known Limitations/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Currently displays fixed synthetic capture EVD-2026-001.pcap/i)
    ).toBeInTheDocument();
  });

  it('triggers onOpenApp callback when clicking launch on a tool', () => {
    const handleOpenApp = vi.fn();

    render(
      <SimulationProvider>
        <CyberCatalogueApp initialMode="arsenal" onOpenApp={handleOpenApp} />
      </SimulationProvider>
    );

    // Netmap is playable and uses terminal
    const launchBtn = screen.getByTestId('btn-arsenal-tool-action');
    fireEvent.click(launchBtn);

    expect(handleOpenApp).toHaveBeenCalledWith('terminal');
    expect(screen.getByTestId('arsenal-action-notice')).toBeInTheDocument();
  });

  it('allows navigation to related tools via related tool buttons', () => {
    render(
      <SimulationProvider>
        <CyberCatalogueApp initialMode="arsenal" />
      </SimulationProvider>
    );

    // Netmap relates to SvcScan
    const relatedBtn = screen.getByTestId('related-tool-tool_svcscan');
    fireEvent.click(relatedBtn);

    expect(screen.getByTestId('selected-tool-name')).toHaveTextContent(/SvcScan/i);
  });
});
