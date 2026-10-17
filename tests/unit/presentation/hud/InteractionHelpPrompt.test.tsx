import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InteractionHelpPrompt } from '@/presentation/hud/InteractionHelpPrompt';

describe('InteractionHelpPrompt Component', () => {
  it('displays the standard beginner-friendly introductory guidance text', () => {
    render(<InteractionHelpPrompt />);

    const message = screen.getByTestId('help-message-text');
    expect(message).toHaveTextContent(
      'Welcome to Cyberlife. Your guided objectives and instructions will appear here as you begin playing.'
    );
  });

  it('supports toggling the guidance details dialog with keyboard focus and accessible state', () => {
    render(<InteractionHelpPrompt />);

    const toggleButton = screen.getByTestId('help-guidance-toggle');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    // Toggle open
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    const dialog = screen.getByRole('dialog', { name: /Accessibility & Guidance Details/i });
    expect(dialog).toBeInTheDocument();
    expect(
      screen.getByText(/Cyberlife is designed so that players with no technical background/i)
    ).toBeInTheDocument();

    // Close via Close button inside dialog
    const closeBtn = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });
});
