import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpCenterApp } from '@/presentation/desktop/apps/HelpCenterApp';

describe('HelpCenterApp Component', () => {
  it('renders the searchable knowledge base interface and initial category', () => {
    render(<HelpCenterApp />);

    expect(screen.getByTestId('help-center-app')).toBeInTheDocument();
    expect(screen.getByTestId('help-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('help-cat-controls')).toBeInTheDocument();
    expect(screen.getByTestId('help-cat-commands')).toBeInTheDocument();
    expect(screen.getByTestId('help-cat-mission')).toBeInTheDocument();
    expect(screen.getByTestId('help-cat-career')).toBeInTheDocument();
    expect(screen.getByTestId('help-cat-persistence')).toBeInTheDocument();

    expect(screen.getAllByText(/3D Movement & Exploration/i).length).toBeGreaterThan(0);
  });

  it('filters knowledge base articles using the search input', () => {
    render(<HelpCenterApp />);

    const searchInput = screen.getByTestId('help-search-input');
    fireEvent.change(searchInput, { target: { value: 'Aster' } });

    expect(screen.getAllByText(/The Aster Incident Lifecycle/i).length).toBeGreaterThan(0);
  });

  it('navigates between help categories', () => {
    render(<HelpCenterApp />);

    fireEvent.click(screen.getByTestId('help-cat-career'));
    expect(screen.getAllByText(/Career Progression & Job Board/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Money, Purchases & Living Expenses/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByTestId('help-cat-persistence'));
    expect(screen.getAllByText(/Persistent Saves & System Recovery/i).length).toBeGreaterThan(0);
  });
});
