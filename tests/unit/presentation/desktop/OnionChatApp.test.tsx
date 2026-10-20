/**
 * Cyberlife — OnionChatApp Unit Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnionChatApp } from '@/presentation/desktop/apps/OnionChatApp';

describe('OnionChatApp', () => {
  it('renders contacts list with Temitope Blessing and Cipher', () => {
    render(<OnionChatApp />);
    expect(screen.getByTestId('onion-chat-app')).toBeInTheDocument();
    expect(screen.getAllByText('Temitope Blessing').length).toBeGreaterThan(0);
    expect(screen.getByText('Cipher')).toBeInTheDocument();
    expect(screen.getByText('Aster SIEM Bot')).toBeInTheDocument();
  });

  it('switches thread when contact is clicked', () => {
    render(<OnionChatApp />);
    const cipherBtn = screen.getByText('Cipher');
    fireEvent.click(cipherBtn);

    expect(
      screen.getByText('Underground Broker & Whistleblower • 0xBoard Syndicate')
    ).toBeInTheDocument();
  });

  it('allows sending custom encrypted message', () => {
    render(<OnionChatApp />);
    const input = screen.getByPlaceholderText(/Send GPG encrypted message/i);
    fireEvent.change(input, { target: { value: 'Investigating anomalous outbound packets now.' } });
    fireEvent.submit(input.closest('form')!);

    expect(
      screen.getAllByText('Investigating anomalous outbound packets now.').length
    ).toBeGreaterThan(0);
  });

  it('allows clicking suggested quick reply', () => {
    render(<OnionChatApp />);
    const quickReply = screen.getByRole('button', { name: /On it now, pulling port telemetry/i });
    expect(quickReply).toBeInTheDocument();

    fireEvent.click(quickReply);
    expect(screen.getAllByText('On it now, pulling port telemetry.').length).toBeGreaterThan(0);
  });

  it('triggers onStartCall when Call Secure Line button is clicked', () => {
    const handleStartCall = vi.fn();
    render(<OnionChatApp onStartCall={handleStartCall} />);

    const callBtn = screen.getByRole('button', { name: /Call Secure Line/i });
    expect(callBtn).toBeInTheDocument();

    fireEvent.click(callBtn);
    expect(handleStartCall).toHaveBeenCalledTimes(1);
    expect(handleStartCall).toHaveBeenCalledWith(
      expect.objectContaining({ contactId: 'amina-okonjo' })
    );
  });
});
