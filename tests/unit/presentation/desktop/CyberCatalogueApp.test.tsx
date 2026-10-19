/**
 * Cyberlife — Milestone 11: CyberCatalogueApp Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CyberCatalogueApp } from '@/presentation/desktop/apps/CyberCatalogueApp';
import { SimulationProvider } from '@/application/simulation/SimulationContext';

describe('CyberCatalogueApp Presentation Component', () => {
  it('renders the catalogue header, tracks tabs, and catalogue entries', () => {
    render(
      <SimulationProvider>
        <CyberCatalogueApp />
      </SimulationProvider>
    );

    expect(screen.getByText('Cyber Catalogue')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /All Tracks/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Blue Team/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Red Team/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Purple Team/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Shared Foundations/i })).toBeInTheDocument();
  });

  it('filters entries when clicking team track tabs', () => {
    render(
      <SimulationProvider>
        <CyberCatalogueApp />
      </SimulationProvider>
    );

    // Click Red Team tab
    fireEvent.click(screen.getByRole('button', { name: /Red Team/i }));
    expect(
      screen.getByText('Authorized Reconnaissance & Attack Surface Mapping')
    ).toBeInTheDocument();

    // Click Purple Team tab
    fireEvent.click(screen.getByRole('button', { name: /Purple Team/i }));
    expect(screen.getByText('Detection Validation & Telemetry Gap Analysis')).toBeInTheDocument();
  });

  it('filters entries by search query', () => {
    render(
      <SimulationProvider>
        <CyberCatalogueApp />
      </SimulationProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Search by topic/i);
    fireEvent.change(searchInput, { target: { value: 'Evidence' } });

    expect(screen.getByText('Incident Response & Digital Evidence Custody')).toBeInTheDocument();
  });

  it('allows selecting an entry to inspect its details and scenario', () => {
    render(
      <SimulationProvider>
        <CyberCatalogueApp />
      </SimulationProvider>
    );

    // Click on SOC Monitoring entry in the list
    fireEvent.click(screen.getAllByText('Security Operations & Alert Triage')[0]!);
    expect(screen.getByText(/Why This Discipline Matters/i)).toBeInTheDocument();
    expect(screen.getByText(/Realistic Lagos Scenario/i)).toBeInTheDocument();
    expect(screen.getByText(/Relevant Tools & Career Pathways/i)).toBeInTheDocument();
  });
});
