import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FieldGuideApp } from '@/presentation/desktop/apps/FieldGuideApp';

describe('FieldGuideApp Component', () => {
  it('renders initial Terminal Basics tab and all navigation tabs', () => {
    render(<FieldGuideApp />);

    expect(screen.getByTestId('field-guide-container')).toBeInTheDocument();
    expect(screen.getByTestId('guide-tab-basics')).toBeInTheDocument();
    expect(screen.getByTestId('guide-tab-commands')).toBeInTheDocument();
    expect(screen.getByTestId('guide-tab-tools')).toBeInTheDocument();
    expect(screen.getByTestId('guide-tab-concepts')).toBeInTheDocument();
    expect(screen.getByTestId('guide-tab-safety')).toBeInTheDocument();

    expect(screen.getByText(/Understanding the Simulated Terminal/i)).toBeInTheDocument();
  });

  it('switches to Command Reference tab and displays all standard and cyber tools', () => {
    render(<FieldGuideApp />);

    fireEvent.click(screen.getByTestId('guide-tab-commands'));

    expect(screen.getByText(/Command Dictionary/i)).toBeInTheDocument();
    expect(screen.getAllByText(/whoami/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/status/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/netmap hosts/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/svcscan inspect/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/logview recent/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/evidence list/i).length).toBeGreaterThan(0);
  });

  it('switches to Security Tools tab and displays tool guides', () => {
    render(<FieldGuideApp />);

    fireEvent.click(screen.getByTestId('guide-tab-tools'));

    expect(screen.getByText(/Interactive Cybersecurity Toolset/i)).toBeInTheDocument();
    expect(screen.getByText(/Network Discovery Tool/i)).toBeInTheDocument();

    // Click svcscan tool guide
    fireEvent.click(screen.getByText(/svcscan \(Services\)/i));
    expect(screen.getByText(/Service Inventory Tool/i)).toBeInTheDocument();

    // Click logview tool guide
    fireEvent.click(screen.getByText(/logview \(Logs\)/i));
    expect(screen.getByText(/Simulated Log Analysis/i)).toBeInTheDocument();

    // Click evidence tool guide
    fireEvent.click(screen.getByText(/evidence \(Forensics\)/i));
    expect(screen.getByText(/Forensic Evidence Inspection/i)).toBeInTheDocument();
  });

  it('switches to Security Concepts tab and displays analogies', () => {
    render(<FieldGuideApp />);

    fireEvent.click(screen.getByTestId('guide-tab-concepts'));
    expect(screen.getByText(/IAM & Least Privilege/i)).toBeInTheDocument();
    expect(screen.getByText(/Cryptographic Hashes/i)).toBeInTheDocument();
  });

  it('switches to Safety Guarantee tab and verifies sandbox guarantees', () => {
    render(<FieldGuideApp />);

    fireEvent.click(screen.getByTestId('guide-tab-safety'));
    expect(screen.getByText(/The Non-Negotiable Safety Guarantee/i)).toBeInTheDocument();
    expect(screen.getByText(/No Host OS Execution/i)).toBeInTheDocument();
  });
});
