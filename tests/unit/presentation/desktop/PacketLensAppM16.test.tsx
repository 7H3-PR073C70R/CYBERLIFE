/**
 * Cyberlife — Milestone 16: Packet Lens GUI Application Unit Tests
 *
 * Verifies tab navigation, interactive topology explorer, traffic stream dissection,
 * threat intelligence correlation, analyst note logging, and conclusion evaluation.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PacketLensApp } from '@/presentation/desktop/apps/PacketLensApp';

describe('PacketLensApp (Milestone 16 Presentation)', () => {
  it('renders application header with title and 4 primary navigation tabs', () => {
    render(<PacketLensApp />);

    expect(screen.getByText(/Packet Lens Pro/i)).toBeInTheDocument();
    expect(screen.getByText(/M16 Forensics & Threat Intel Suite/i)).toBeInTheDocument();
    expect(screen.getByText(/\/mnt\/evidence\/EVD-2026-001\.pcap/i)).toBeInTheDocument();

    // Verify 4 tabs
    expect(screen.getByRole('button', { name: /Network Topology/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Traffic Stream/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Threat Intelligence/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Investigation & Findings/i })).toBeInTheDocument();
  });

  it('navigates to Network Topology tab and displays segments and host cards', () => {
    render(<PacketLensApp initialTab="topology" />);

    // Verify topology controls
    expect(screen.getAllByText(/Segment:/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Marina Corporate LAN/i)).toBeInTheDocument();

    // Check presence of key hosts
    expect(screen.getAllByText('app-portal-01').length).toBeGreaterThan(0);
    expect(screen.getAllByText('filesrv-01').length).toBeGreaterThan(0);
    expect(screen.getAllByText('dc-core-01').length).toBeGreaterThan(0);

    // Select a host
    const portalCard = screen.getAllByText('app-portal-01')[0]!;
    fireEvent.click(portalCard);

    // Host inspector details
    expect(screen.getByText(/Host Inspector/i)).toBeInTheDocument();
    expect(screen.getByText(/KNOWN SERVICES & PORTS/i)).toBeInTheDocument();
    expect(screen.getByText(/OBSERVED TOPOLOGY LINKS/i)).toBeInTheDocument();
  });

  it('filters traffic by protocol and displays layer dissection for selected frame', () => {
    render(<PacketLensApp initialTab="traffic" />);

    // Default view shows frames
    expect(screen.getByText(/Who has 10\.0\.4\.1\?/i)).toBeInTheDocument();

    // Click protocol filter SMB2
    const smbBtn = screen.getByRole('button', { name: 'SMB2' });
    fireEvent.click(smbBtn);

    // ARP frame is filtered out
    expect(screen.queryByText(/Who has 10\.0\.4\.1\?/i)).not.toBeInTheDocument();

    // SMB2 frames are shown
    expect(screen.getByText(/Negotiate Protocol Request/i)).toBeInTheDocument();
    expect(screen.getAllByText(/payroll\$/i).length).toBeGreaterThan(0);

    // Dissection tree
    expect(screen.getByText(/Packet Dissection/i)).toBeInTheDocument();
    expect(screen.getByText(/Hex \/ ASCII Payload Stream/i)).toBeInTheDocument();
  });

  it('navigates to Threat Intelligence tab, displays indicators, and triggers correlation', async () => {
    render(<PacketLensApp initialTab="intel" />);

    // Indicators list
    expect(screen.getAllByText('198.51.100.45').length).toBeGreaterThan(0);
    expect(screen.getByText(/telemetry-sync\.ekonexus-update\.net/i)).toBeInTheDocument();

    // Click on C2 IP indicator
    const c2Row = screen.getAllByText('198.51.100.45')[0]!;
    fireEvent.click(c2Row);

    expect(screen.getByText(/Threat Indicator Dossier/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Phantom Weaver/i).length).toBeGreaterThan(0);

    // Click correlate against traffic
    const correlateBtn = screen.getByRole('button', { name: /⚡ Correlate Against Traffic/i });
    fireEvent.click(correlateBtn);

    expect(screen.getByText(/TRAFFIC CORRELATION MATCHES/i)).toBeInTheDocument();
    expect(screen.getAllByText('198.51.100.45').length).toBeGreaterThan(0);
  });

  it('navigates to Investigation tab and tracks objectives checklist', () => {
    render(<PacketLensApp initialTab="investigation" />);

    expect(screen.getByText(/Operation Marina Nexus/i)).toBeInTheDocument();
    expect(screen.getByText(/CASE INVESTIGATION OBJECTIVES/i)).toBeInTheDocument();

    // Verify key objectives
    expect(screen.getByText(/1\. Inspect DMZ Application Cluster in Topology/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Filter Synthetic Traffic by TLS Protocol/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Dissect Outbound C2 Beacon Frame/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Correlate Suspect IP 198\.51\.100\.45 in Threat Intel/i)).toBeInTheDocument();
  });

  it('allows logging an analyst note in the investigation case log', () => {
    render(<PacketLensApp initialTab="investigation" />);

    // Switch to notes subtab
    const notesTabBtn = screen.getByRole('button', { name: /Analyst Notes/i });
    fireEvent.click(notesTabBtn);

    const titleInput = screen.getByPlaceholderText(/Observation Title/i);
    const contentInput = screen.getByPlaceholderText(/Detailed findings/i);
    const saveBtn = screen.getByRole('button', { name: /Save Observation/i });

    fireEvent.change(titleInput, { target: { value: 'Beacon Cadence Analysis' } });
    fireEvent.change(contentInput, { target: { value: 'Identified regular 60s heartbeat to 198.51.100.45.' } });
    fireEvent.click(saveBtn);

    expect(screen.getByText('Beacon Cadence Analysis')).toBeInTheDocument();
    expect(screen.getByText('Identified regular 60s heartbeat to 198.51.100.45.')).toBeInTheDocument();
  });

  it('submits formal forensic conclusion and renders evaluation approval debrief', () => {
    render(<PacketLensApp initialTab="investigation" />);

    // Switch to submit subtab
    const submitTabBtn = screen.getByRole('button', { name: /Submit Formal Finding/i });
    fireEvent.click(submitTabBtn);

    expect(screen.getByText(/Submit Formal Forensic Investigation Finding/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Submit Formal Forensic Report/i });
    fireEvent.click(submitBtn);

    // Verify evaluation debrief card renders
    expect(screen.getByText(/Evaluation Result: APPROVED/i)).toBeInTheDocument();
    expect(screen.getByText(/✓ Suspected Threat Actor Identification/i)).toBeInTheDocument();
    expect(screen.getByText(/✓ Compromised Host Attribution/i)).toBeInTheDocument();
    expect(screen.getByText(/✓ Command & Control Channel Isolation/i)).toBeInTheDocument();
    expect(screen.getByText(/✓ False Positive Recognition \(Benign SIEM Scanner\)/i)).toBeInTheDocument();
  });
});
