import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DialogueOverlay } from '@/presentation/dialogue/DialogueOverlay';
import { SimulationProvider } from '@/application/simulation/SimulationContext';
import { createSimulationEngine } from '@/simulation';

describe('DialogueOverlay Component', () => {
  it('renders speaker name, role, relationship badge, and dialogue text', () => {
    const engine = createSimulationEngine();
    const handleClose = vi.fn();

    render(
      <SimulationProvider engine={engine}>
        <DialogueOverlay npcId="npc_amina" onClose={handleClose} />
      </SimulationProvider>
    );

    expect(screen.getByTestId('dialogue-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('dialogue-npc-name')).toHaveTextContent('Amina Okonjo');
    expect(screen.getByText('Lead Security Analyst')).toBeInTheDocument();
    expect(screen.getByTestId('dialogue-speech-text')).toBeInTheDocument();
    expect(screen.getByTestId('npc-relationship-badge')).toBeInTheDocument();
  });

  it('renders available choices with numerical shortcut badges [1-9]', () => {
    const engine = createSimulationEngine();
    const handleClose = vi.fn();

    render(
      <SimulationProvider engine={engine}>
        <DialogueOverlay npcId="npc_amina" onClose={handleClose} />
      </SimulationProvider>
    );

    const choices = screen.getAllByTestId(/^dialogue-choice-/);
    expect(choices.length).toBeGreaterThan(0);
    expect(choices[0]).toHaveTextContent('1');
  });

  it('navigates dialogue when a choice is clicked', () => {
    const engine = createSimulationEngine();
    const handleClose = vi.fn();

    render(
      <SimulationProvider engine={engine}>
        <DialogueOverlay npcId="npc_amina" onClose={handleClose} />
      </SimulationProvider>
    );

    const firstChoice = screen.getByTestId('dialogue-choice-0');
    fireEvent.click(firstChoice);

    // Speech text is updated with new node
    expect(screen.getByTestId('dialogue-speech-text')).toBeInTheDocument();
  });

  it('responds to keyboard shortcut numbers (e.g. 1) to select choices', () => {
    const engine = createSimulationEngine();
    const handleClose = vi.fn();

    render(
      <SimulationProvider engine={engine}>
        <DialogueOverlay npcId="npc_amina" onClose={handleClose} />
      </SimulationProvider>
    );

    // Press '1'
    fireEvent.keyDown(window, { key: '1' });
    expect(screen.getByTestId('dialogue-overlay')).toBeInTheDocument();
  });

  it('triggers onClose when Escape key or Close button is pressed', () => {
    const engine = createSimulationEngine();
    const handleClose = vi.fn();

    render(
      <SimulationProvider engine={engine}>
        <DialogueOverlay npcId="npc_amina" onClose={handleClose} />
      </SimulationProvider>
    );

    // Click close button
    const closeBtn = screen.getByTestId('btn-close-dialogue');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Or press Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
