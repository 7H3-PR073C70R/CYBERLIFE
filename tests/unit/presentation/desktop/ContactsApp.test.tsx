import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ContactsApp } from '@/presentation/desktop/apps/ContactsApp';
import { SimulationProvider } from '@/application/simulation/SimulationContext';
import { createSimulationEngine } from '@/simulation';

describe('ContactsApp Component', () => {
  it('renders directory title, filter tabs, and all contact entries', () => {
    render(
      <SimulationProvider>
        <ContactsApp />
      </SimulationProvider>
    );

    expect(screen.getByTestId('contacts-app')).toBeInTheDocument();
    expect(screen.getByText(/Lagos Directory/i)).toBeInTheDocument();

    // Verify all contact items
    const contactItems = screen.getAllByTestId(/^contact-item-/);
    expect(contactItems.length).toBe(9);
  });

  it('filters contacts by organization/category tabs', () => {
    render(
      <SimulationProvider>
        <ContactsApp />
      </SimulationProvider>
    );

    // Filter by Cedarline
    fireEvent.click(screen.getByTestId('filter-btn-cedarline'));
    expect(screen.getByTestId('contact-item-npc_amina')).toBeInTheDocument();
    expect(screen.getByTestId('contact-item-npc_marcus')).toBeInTheDocument();
    expect(screen.getByTestId('contact-item-npc_elena')).toBeInTheDocument();
    expect(screen.getByTestId('contact-item-npc_femi')).toBeInTheDocument();
    expect(screen.queryByTestId('contact-item-npc_nkechi')).not.toBeInTheDocument();

    // Filter by Community
    fireEvent.click(screen.getByTestId('filter-btn-community'));
    expect(screen.getByTestId('contact-item-npc_nkechi')).toBeInTheDocument();
    expect(screen.getByTestId('contact-item-npc_segun')).toBeInTheDocument();
    expect(screen.queryByTestId('contact-item-npc_amina')).not.toBeInTheDocument();
  });

  it('displays detailed dossier, schedule, and relationship progress bar when contact is selected', () => {
    render(
      <SimulationProvider>
        <ContactsApp />
      </SimulationProvider>
    );

    // Select Uncle Segun
    fireEvent.click(screen.getByTestId('contact-item-npc_segun'));

    expect(screen.getByTestId('contact-detail-name')).toHaveTextContent('Uncle Segun');
    expect(screen.getByTestId('contact-detail-role')).toHaveTextContent('Community Elder');
    expect(screen.getByTestId('relationship-value-display')).toBeInTheDocument();
    expect(screen.getByTestId('current-activity-display')).toBeInTheDocument();
    expect(screen.getByText(/Discovered Intel & Notes/i)).toBeInTheDocument();
  });

  it('updates dynamically when relationship or memory changes in simulation', () => {
    const engine = createSimulationEngine();

    render(
      <SimulationProvider engine={engine}>
        <ContactsApp />
      </SimulationProvider>
    );

    // Select Barry
    fireEvent.click(screen.getByTestId('contact-item-npc_marcus'));
    expect(screen.getByTestId('relationship-value-display')).toHaveTextContent('Neutral (0)');

    // Dispatch relationship change inside act
    act(() => {
      engine.dispatch({
        type: 'ChangeNpcRelationship',
        npcId: 'npc_marcus',
        delta: 35,
        reason: 'Helped with investigation',
      });
    });

    // Verify UI reflects new score and Friendly band
    expect(screen.getByTestId('relationship-value-display')).toHaveTextContent('Friendly (+35)');
  });
});
