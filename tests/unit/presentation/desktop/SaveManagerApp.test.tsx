import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SaveManagerApp } from '../../../../src/presentation/desktop/apps/SaveManagerApp';
import { SimulationProvider } from '../../../../src/application/simulation/SimulationProvider';
import { PersistenceProvider } from '../../../../src/application/persistence/PersistenceContext';
import { MemoryStorageAdapter } from '../../../../src/application/persistence/adapters/MemoryStorageAdapter';
import { createSimulationEngine } from '../../../../src/simulation';

describe('SaveManagerApp Desktop Component', () => {
  function renderWithProviders() {
    const engine = createSimulationEngine();
    const storage = new MemoryStorageAdapter();

    const utils = render(
      <SimulationProvider engine={engine}>
        <PersistenceProvider storageOverride={storage} autoLoadOnStart={false}>
          <SaveManagerApp />
        </PersistenceProvider>
      </SimulationProvider>
    );

    return { ...utils, engine, storage };
  }

  it('renders SaveManagerApp and displays save slots', async () => {
    renderWithProviders();

    expect(screen.getByTestId('save-manager-app')).toBeInTheDocument();
    expect(screen.getByText('Persistence Vault')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('app-slot-row-slot_1')).toBeInTheDocument();
      expect(screen.getByTestId('app-slot-row-slot_2')).toBeInTheDocument();
      expect(screen.getByTestId('app-slot-row-slot_3')).toBeInTheDocument();
    });
  });

  it('performs quick save from app', async () => {
    renderWithProviders();

    const quickSaveBtn = screen.getByTestId('btn-app-quicksave');
    fireEvent.click(quickSaveBtn);

    await waitFor(() => {
      expect(screen.getByTestId('app-save-status-badge')).toHaveTextContent('SAVED');
      expect(screen.getByTestId('app-slot-badge-slot_1')).toHaveTextContent('● VALID');
    });
  });

  it('switches to Integrity Audit tab and displays checksum', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId('app-slot-row-slot_1')).toBeInTheDocument();
    });

    const auditTabBtn = screen.getByTestId('tab-save-audit');
    fireEvent.click(auditTabBtn);

    expect(screen.getByText('Data Integrity & Checksum Verification')).toBeInTheDocument();
    const checksumElem = screen.getByTestId('audit-current-checksum');
    expect(checksumElem).toBeInTheDocument();
    expect(checksumElem.textContent).toMatch(/^[0-9a-f]{8}$/i);
  });

  it('switches to State Snapshot tab and renders JSON textarea', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId('app-slot-row-slot_1')).toBeInTheDocument();
    });

    const rawTabBtn = screen.getByTestId('tab-save-raw');
    fireEvent.click(rawTabBtn);

    expect(screen.getByText('Authoritative State JSON')).toBeInTheDocument();
    const textarea = screen.getByTestId('raw-state-textarea') as HTMLTextAreaElement;
    expect(textarea.value).toContain('"schemaVersion"');
  });

  it('saves slot 2, then deletes it with confirmation', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId('btn-app-save-slot_2')).toBeInTheDocument();
    });

    // Save to slot 2
    const saveSlot2Btn = screen.getByTestId('btn-app-save-slot_2');
    fireEvent.click(saveSlot2Btn);

    await waitFor(() => {
      expect(screen.getByTestId('app-slot-badge-slot_2')).toHaveTextContent('● VALID');
    });

    // Click delete
    const deleteBtn = screen.getByTestId('btn-app-delete-slot_2');
    fireEvent.click(deleteBtn);

    // Confirmation dialog appears
    expect(screen.getByTestId('app-confirm-delete-modal')).toBeInTheDocument();

    // Confirm deletion
    const confirmBtn = screen.getByTestId('btn-app-confirm-delete');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByTestId('app-slot-badge-slot_2')).toHaveTextContent('● EMPTY');
    });
  });
});
