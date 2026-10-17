import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React, { useState } from 'react';
import {
  SimulationProvider,
  useSimulation,
  useOptionalSimulation,
} from '@/application/simulation/SimulationContext';
import { createSimulationEngine } from '@/simulation';

const TestConsumer: React.FC = () => {
  const { state, dispatch } = useSimulation();

  return (
    <div>
      <div data-testid="test-rev">Rev: {state.metadata.revision}</div>
      <div data-testid="test-funds">Funds: {state.player.moneyKobo}</div>
      <button
        type="button"
        data-testid="test-btn-credit"
        onClick={() => dispatch({ type: 'CreditMoney', amountKobo: 10_000 })}
      >
        Credit
      </button>
    </div>
  );
};

const OptionalConsumer: React.FC = () => {
  const sim = useOptionalSimulation();
  return <div data-testid="opt-consumer">{sim ? 'Has Simulation' : 'No Simulation'}</div>;
};

describe('SimulationContext and Provider', () => {
  it('provides simulation state and allows dispatching commands', () => {
    render(
      <SimulationProvider>
        <TestConsumer />
      </SimulationProvider>
    );

    expect(screen.getByTestId('test-rev')).toHaveTextContent('Rev: 0');
    expect(screen.getByTestId('test-funds')).toHaveTextContent('Funds: 250000');

    act(() => {
      screen.getByTestId('test-btn-credit').click();
    });

    expect(screen.getByTestId('test-rev')).toHaveTextContent('Rev: 1');
    expect(screen.getByTestId('test-funds')).toHaveTextContent('Funds: 260000');
  });

  it('accepts an injected custom SimulationEngine instance', () => {
    const customEngine = createSimulationEngine({
      initialOverrides: {
        playerName: 'Custom Hero',
        moneyKobo: 777_000,
      },
    });

    render(
      <SimulationProvider engine={customEngine}>
        <TestConsumer />
      </SimulationProvider>
    );

    expect(screen.getByTestId('test-funds')).toHaveTextContent('Funds: 777000');
  });

  it('does not re-create engine instance across parent component rerenders', () => {
    let capturedEngine1: unknown;
    let capturedEngine2: unknown;

    const ConsumerWithCapture: React.FC<{ renderCount: number }> = ({ renderCount }) => {
      const { engine } = useSimulation();
      if (renderCount === 1) capturedEngine1 = engine;
      if (renderCount === 2) capturedEngine2 = engine;
      return <div data-testid="render-count">Count: {renderCount}</div>;
    };

    const ParentWrapper: React.FC = () => {
      const [count, setCount] = useState(1);
      return (
        <SimulationProvider>
          <ConsumerWithCapture renderCount={count} />
          <button
            type="button"
            data-testid="btn-rerender"
            onClick={() => setCount(prev => prev + 1)}
          >
            Rerender
          </button>
        </SimulationProvider>
      );
    };

    render(<ParentWrapper />);

    act(() => {
      screen.getByTestId('btn-rerender').click();
    });

    expect(screen.getByTestId('render-count')).toHaveTextContent('Count: 2');
    expect(capturedEngine1).toBeDefined();
    expect(capturedEngine1).toBe(capturedEngine2);
  });

  it('throws helpful error if useSimulation is called outside SimulationProvider', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      /useSimulation must be used within a <SimulationProvider>/i
    );
  });

  it('useOptionalSimulation returns null gracefully outside SimulationProvider', () => {
    render(<OptionalConsumer />);
    expect(screen.getByTestId('opt-consumer')).toHaveTextContent('No Simulation');
  });
});
