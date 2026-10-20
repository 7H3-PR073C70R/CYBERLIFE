/**
 * Cyberlife — TorBrowserApp Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TorBrowserApp } from '@/presentation/desktop/apps/TorBrowserApp';
import { virtualFilesystem } from '@/simulation/cyber/filesystem';

describe('TorBrowserApp', () => {
  beforeEach(() => {
    virtualFilesystem.reset();
  });

  it('renders Tor Browser toolbar with default wiki.onion address', () => {
    render(<TorBrowserApp />);
    expect(screen.getByTestId('tor-browser-app')).toBeInTheDocument();
    expect(screen.getByDisplayValue('wiki.onion')).toBeInTheDocument();
    expect(screen.getAllByText(/The Hidden Wiki/i).length).toBeGreaterThan(0);
  });

  it('opens and toggles the multi-hop Tor circuit inspector modal', () => {
    render(<TorBrowserApp />);
    const circuitBtn = screen.getByTitle(/Inspect Tor Multi-Hop Circuit/i);
    expect(circuitBtn).toBeInTheDocument();

    fireEvent.click(circuitBtn);
    expect(screen.getByText(/GUARD NODE \(ENTRY\)/i)).toBeInTheDocument();
    expect(screen.getByText(/MIDDLE RELAY/i)).toBeInTheDocument();
    expect(screen.getByText(/EXIT \/ RENDEZVOUS/i)).toBeInTheDocument();
    expect(screen.getByText(/Encrypted & Anonymous/i)).toBeInTheDocument();
  });

  it('navigates to ciphermarket.onion and displays market listings', () => {
    render(<TorBrowserApp />);
    const input = screen.getByDisplayValue('wiki.onion');
    fireEvent.change(input, { target: { value: 'ciphermarket.onion' } });
    fireEvent.submit(input.closest('form')!);

    expect(
      screen.getByText(/CipherMarket \/\/ Underground Security Exchange/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Lagos Enterprise Sec Wordlist/i)).toBeInTheDocument();
  });

  it('allows purchasing a market listing and writes artifact to VFS downloads', () => {
    render(<TorBrowserApp />);
    const input = screen.getByDisplayValue('wiki.onion');
    fireEvent.change(input, { target: { value: 'ciphermarket.onion' } });
    fireEvent.submit(input.closest('form')!);

    // Find first purchase button
    const purchaseBtn = screen.getAllByRole('button', { name: /Purchase/i })[0]!;
    expect(purchaseBtn).toBeInTheDocument();

    fireEvent.click(purchaseBtn);

    // Verify success banner and button text change
    expect(screen.getByText(/✓ Escrow Cleared!/i)).toBeInTheDocument();
    expect(screen.getByText(/✓ In VFS Downloads/i)).toBeInTheDocument();

    // Verify VFS has the delivered wordlist
    const vfsFile = virtualFilesystem.readFile(
      '/home/analyst/downloads/lagos_enterprise_wordlist.txt'
    );
    expect(vfsFile).not.toBeNull();
    expect(vfsFile?.content).toContain('Lagos Enterprise Target Candidates');
  });

  it('navigates to deepleaks.onion and allows downloading leak dump to VFS', () => {
    render(<TorBrowserApp />);
    const input = screen.getByDisplayValue('wiki.onion');
    fireEvent.change(input, { target: { value: 'deepleaks.onion' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.getByText(/DeepLeaks \/\/ Whistleblower Vault/i)).toBeInTheDocument();

    const downloadBtn = screen.getByRole('button', { name: /Download to VFS/i });
    fireEvent.click(downloadBtn);

    expect(screen.getByText(/✓ Saved to \/downloads/i)).toBeInTheDocument();
  });

  it('navigates to 0xboard.onion and allows posting anonymous reply', () => {
    render(<TorBrowserApp />);
    const input = screen.getByDisplayValue('wiki.onion');
    fireEvent.change(input, { target: { value: '0xboard.onion' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.getByText(/0xBoard \/\/ Underground Hacker Community/i)).toBeInTheDocument();

    const replyInput = screen.getByPlaceholderText(/Post encrypted anonymous reply/i);
    fireEvent.change(replyInput, {
      target: { value: 'Tested the Suricata bypass rule on broad street.' },
    });

    const postBtn = screen.getByRole('button', { name: /Post/i });
    fireEvent.click(postBtn);

    expect(
      screen.getByText('Tested the Suricata bypass rule on broad street.')
    ).toBeInTheDocument();
  });
});
