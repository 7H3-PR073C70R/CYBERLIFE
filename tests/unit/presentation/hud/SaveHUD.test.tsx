import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SaveStatusIndicator } from '../../../../src/presentation/hud/SaveStatusIndicator';
import { SaveManagerModal } from '../../../../src/presentation/hud/SaveManagerModal';
import { SimulationProvider } from '../../../../src/application/simulation/SimulationProvider';
import { PersistenceProvider } from '../../../../src/application/persistence/PersistenceContext';
import { MemoryStorageAdapter } from '../../../../src/application/persistence/adapters/MemoryStorageAdapter';
import { createSimulationEngine } from '../../../../src/simulation';

describe('HUD SaveStatusIndicator & SaveManagerModal Components', () => {
  it('renders SaveStatusIndicator and opens modal on click', () => {
    const onOpen = vi.fn();
    const engine = createSimulationEngine();
    const storage = new MemoryStorageAdapter();

    render(
      <SimulationProvider engine={engine}>
        <PersistenceProvider storageOverride={storage} autoLoadOnStart={false}>
          <SaveStatusIndicator onOpenSaveModal={onOpen} />
        </PersistenceProvider>
      </SimulationProvider>
    );

    const btn = screen.getByTestId('hud-save-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('renders SaveManagerModal with slots and allows quick saving', async () => {
    const onClose = vi.fn();
    const engine = createSimulationEngine();
    const storage = new MemoryStorageAdapter();

    render(
      <SimulationProvider engine={engine}>
        <PersistenceProvider storageOverride={storage} autoLoadOnStart={false}>
          <SaveManagerModal isOpen={true} onClose={onClose} />
        </PersistenceProvider>
      </SimulationProvider>
    );

    expect(screen.getByTestId('save-manager-modal')).toBeInTheDocument();
    expect(screen.getByText('Data Persistence & Recovery Manager')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('save-slot-card-slot_1')).toBeInTheDocument();
      expect(screen.getByTestId('slot-status-badge-slot_1')).toHaveTextContent('Empty Slot');
    });

    // Quick save active slot
    const quickSaveBtn = screen.getByTestId('btn-save-modal-quicksave');
    fireEvent.click(quickSaveBtn);

    await waitFor(() => {
      expect(screen.getByTestId('slot-status-badge-slot_1')).toHaveTextContent('● Valid Save');
      expect(screen.getByTestId('save-modal-global-status')).toHaveTextContent('✓ Saved');
    });
  });

  it('handles New Game confirmation dialog safely', async () => {
    const onClose = vi.fn();
    const engine = createSimulationEngine();
    const storage = new MemoryStorageAdapter();

    render(
      <SimulationProvider engine={engine}>
        <PersistenceProvider storageOverride={storage} autoLoadOnStart={false}>
          <SaveManagerModal isOpen={true} onClose={onClose} />
        </PersistenceProvider>
      </SimulationProvider>
    );

    const newGameBtn = screen.getByTestId('btn-modal-new-game');
    fireEvent.click(newGameBtn);

    // Confirmation dialog appears
    expect(screen.getByTestId('confirm-new-game-modal')).toBeInTheDocument();

    // Cancel first
    const cancelBtn = screen.getByTestId('btn-cancel-new-game');
    fireEvent.click(cancelBtn);
    expect(screen.queryByTestId('confirm-new-game-modal')).not.toBeInTheDocument();

    // Click again and confirm
    fireEvent.click(newGameBtn);
    const confirmBtn = screen.getByTestId('btn-confirm-new-game');
    fireEvent.click(confirmBtn);

    expect(screen.queryByTestId('confirm-new-game-modal')).not.toBeInTheDocument();
  });
});
