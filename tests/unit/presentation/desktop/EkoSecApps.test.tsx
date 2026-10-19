import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileManagerApp } from '@/presentation/desktop/apps/FileManagerApp';
import { PacketLensApp } from '@/presentation/desktop/apps/PacketLensApp';
import { RevLensApp } from '@/presentation/desktop/apps/RevLensApp';
import { RuleTunerApp } from '@/presentation/desktop/apps/RuleTunerApp';

describe('EkoSec Workstation GUI Applications (M11 Extension)', () => {
  describe('FileManagerApp', () => {
    it('renders initial directory path and location bookmarks', () => {
      render(<FileManagerApp />);
      expect(screen.getByText('Locations')).toBeInTheDocument();
      expect(screen.getByText(/Home \(\/home\/analyst\)/i)).toBeInTheDocument();
      expect(screen.getByText(/System Logs \(\/var\/log\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Evidence Vault \(\/mnt\/evidence\)/i)).toBeInTheDocument();
    });

    it('navigates to system logs and previews auth.log when clicked', () => {
      render(<FileManagerApp />);
      const logsBookmark = screen.getByText(/System Logs \(\/var\/log\)/i);
      fireEvent.click(logsBookmark);

      // auth.log should now appear in the file table
      const authRow = screen.getByText('auth.log');
      expect(authRow).toBeInTheDocument();

      // Click auth.log to open preview pane
      fireEvent.click(authRow);
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getAllByText(/Path:/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/sshd\[4912\]/i)).toBeInTheDocument();
    });

    it('allows creating a new virtual file in /home/analyst', () => {
      render(<FileManagerApp />);
      const newFileBtn = screen.getByText('+ New File');
      fireEvent.click(newFileBtn);

      const input = screen.getByPlaceholderText('my_notes.txt');
      fireEvent.change(input, { target: { value: 'test_investigation.md' } });

      const saveBtn = screen.getByText('Save');
      fireEvent.click(saveBtn);

      expect(screen.getByText(/Created virtual file:/i)).toBeInTheDocument();
      expect(screen.getByText('test_investigation.md')).toBeInTheDocument();
    });
  });

  describe('PacketLensApp', () => {
    it('renders packet capture stream and metadata from /mnt/evidence/EVD-2026-001.pcap', () => {
      render(<PacketLensApp />);
      expect(screen.getByText(/\/mnt\/evidence\/EVD-2026-001\.pcap/i)).toBeInTheDocument();
      expect(screen.getByText(/Who has 10\.0\.4\.1\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Negotiate Protocol Request/i)).toBeInTheDocument();
    });

    it('filters packet list when clicking SMB2 protocol filter', () => {
      render(<PacketLensApp />);
      const smbBtn = screen.getByRole('button', { name: 'SMB2' });
      fireEvent.click(smbBtn);

      // ARP packet #1 should be filtered out
      expect(screen.queryByText(/Who has 10\.0\.4\.1\?/i)).not.toBeInTheDocument();
      // SMB2 packet should be visible
      expect(screen.getByText(/Tree Connect Request/i)).toBeInTheDocument();
    });

    it('displays layer dissection and hex dump for selected anomalous packet', () => {
      render(<PacketLensApp />);
      const targetRow = screen.getAllByText(/payroll\$/i)[0];
      expect(targetRow).toBeDefined();
      if (!targetRow) throw new Error('Target packet row not found');
      fireEvent.click(targetRow);

      expect(screen.getByText(/Packet Dissection/i)).toBeInTheDocument();
      expect(screen.getByText(/Hex \/ ASCII Payload Stream/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Incident Finding: Frame #10 confirms unconstrained SMB2 Tree Connect/i)
      ).toBeInTheDocument();
    });
  });

  describe('RevLensApp', () => {
    it('renders target binary metadata and function symbols', () => {
      render(<RevLensApp />);
      expect(screen.getByText(/\/opt\/tools\/aster_agent_daemon\.bin/i)).toBeInTheDocument();
      expect(screen.getByText('Function Symbols')).toBeInTheDocument();
      expect(screen.getByText(/main\(\)/i)).toBeInTheDocument();
      expect(screen.getAllByText(/evaluate_policy_scope/i).length).toBeGreaterThan(0);
    });

    it('highlights vulnerability in evaluate_policy_scope pseudocode', () => {
      render(<RevLensApp />);
      const vulnSymbols = screen.getAllByText(/evaluate_policy_scope/i);
      expect(vulnSymbols[0]).toBeDefined();
      if (!vulnSymbols[0]) throw new Error('Target function symbol not found');
      fireEvent.click(vulnSymbols[0]);

      expect(screen.getByText(/FLAW/i)).toBeInTheDocument();
      expect(screen.getByText(/Bypassing IAM boundary check/i)).toBeInTheDocument();
      expect(screen.getByText(/legacy_admin_override == 1/i)).toBeInTheDocument();
    });

    it('switches to Strings (.rodata) and searches extracted literals', () => {
      render(<RevLensApp />);
      const stringsTab = screen.getByText('Strings (.rodata)');
      fireEvent.click(stringsTab);

      expect(screen.getByText(/svc-aster/i)).toBeInTheDocument();
      expect(screen.getByText(/\\\\filesrv-01\\payroll\$/i)).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/Search extracted strings/i);
      fireEvent.change(searchInput, { target: { value: 'Bearer' } });

      expect(screen.getByText(/Authorization: Bearer/i)).toBeInTheDocument();
    });

    it('switches to Headers & ELF and inspects section table', () => {
      render(<RevLensApp />);
      const headersTab = screen.getByText('Headers & ELF');
      fireEvent.click(headersTab);

      expect(screen.getByText(/ELF File Header/i)).toBeInTheDocument();
      expect(screen.getByText(/Section Headers/i)).toBeInTheDocument();
      expect(screen.getByText(/\.text.*Executable Code/i)).toBeInTheDocument();
    });
  });

  describe('RuleTunerApp', () => {
    it('renders SIEM rules list and expression editor', () => {
      render(<RuleTunerApp />);
      expect(screen.getByText('Rule Tuner')).toBeInTheDocument();
      expect(screen.getAllByText(/RULE-001/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Service Account Anomalous Share Access/i).length).toBeGreaterThan(
        0
      );
    });

    it('tunes threshold and deploys rule configuration', () => {
      render(<RuleTunerApp />);
      const thresholdInput = screen.getByDisplayValue('1');
      fireEvent.change(thresholdInput, { target: { value: '2' } });

      const deployBtn = screen.getByText('Deploy Tuned Rule');
      fireEvent.click(deployBtn);

      expect(
        screen.getByText(/Rule configuration deployed to synthetic SIEM engine/i)
      ).toBeInTheDocument();
    });

    it('executes attack replay scenarios and reports detection metrics', () => {
      render(<RuleTunerApp />);
      const replayAttackBtn = screen.getByText(/Replay: Aster Attack \(TP Test\)/i);
      fireEvent.click(replayAttackBtn);

      expect(screen.getByText(/VERDICT: OPTIMAL/i)).toBeInTheDocument();
      expect(screen.getByText(/Threat caught! Alert generated/i)).toBeInTheDocument();
      expect(screen.getByText(/True Positives: 1/i)).toBeInTheDocument();
      expect(screen.getByText(/False Positives: 0/i)).toBeInTheDocument();
    });
  });
});
