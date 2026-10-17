import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InteractionPrompt } from '@/presentation/hud/InteractionPrompt';
import { InteractableDefinition } from '@/presentation/world/worldConfig';

describe('InteractionPrompt Component', () => {
  const target: InteractableDefinition = {
    id: 'test_cedarline',
    name: 'Cedarline Services HQ',
    promptAction: 'enter corporate lobby [E]',
    description: 'Regional headquarters of Cedarline Services.',
    position: [10, 0, 0],
    radius: 2.5,
  };

  it('renders nothing when target is null', () => {
    const { container } = render(<InteractionPrompt target={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders target name, description, and action when target is present', () => {
    render(<InteractionPrompt target={target} />);

    expect(screen.getByTestId('interaction-prompt')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-target-title')).toHaveTextContent('Cedarline Services HQ');
    expect(screen.getByText('Regional headquarters of Cedarline Services.')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-action-text')).toHaveTextContent(
      'Press E to enter corporate lobby [E]'
    );
  });

  it('triggers onInteract when activate button is clicked', () => {
    const handleInteract = vi.fn();
    render(<InteractionPrompt target={target} onInteract={handleInteract} />);

    const activateBtn = screen.getByTestId('btn-interact-action');
    fireEvent.click(activateBtn);
    expect(handleInteract).toHaveBeenCalledTimes(1);
  });
});
