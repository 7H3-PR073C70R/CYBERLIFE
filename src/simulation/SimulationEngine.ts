import { SimulationState } from './core/types';
import { createInitialSimulationState, InitialStateOverrides } from './core/initialState';
import { validateSimulationState } from './core/invariants';
import { handleCommand } from './commands/commandHandler';
import { SimulationCommand, CommandResult } from './commands/types';
import { SimulationEvent, SimulationEventType } from './events/types';

export type StateListener = (
  state: Readonly<SimulationState>,
  events: ReadonlyArray<SimulationEvent>
) => void;

export type EventListener = (event: SimulationEvent) => void;

export interface SimulationEngineOptions {
  readonly initialState?: SimulationState;
  readonly initialOverrides?: InitialStateOverrides;
  readonly onListenerError?: (
    error: Error,
    context: { listenerType: 'state' | 'event'; eventType?: string }
  ) => void;
}

/**
 * Authoritative, deterministic headless simulation engine for Cyberlife.
 * Manages game state, validates and executes commands, and publishes domain events.
 * Fully decoupled from WebGL, Three.js, React, and DOM.
 */
export class SimulationEngine {
  private _state: Readonly<SimulationState>;
  private _stateListeners: Set<StateListener> = new Set();
  private _eventListeners: Map<SimulationEventType, Set<EventListener>> = new Map();
  private _onListenerError?: (
    error: Error,
    context: { listenerType: 'state' | 'event'; eventType?: string }
  ) => void;
  private _isDisposed = false;

  constructor(options?: SimulationEngineOptions) {
    if (options?.initialState) {
      this._state = options.initialState;
    } else {
      this._state = createInitialSimulationState(options?.initialOverrides);
    }
    this._onListenerError = options?.onListenerError;
  }

  /**
   * Returns a read-only snapshot of current authoritative simulation state.
   */
  public getState(): Readonly<SimulationState> {
    return this._state;
  }

  /**
   * Restores authoritative simulation state from a loaded save record.
   * Validates state invariants, updates internal state, and notifies listeners.
   */
  public loadState(newState: Readonly<SimulationState>): void {
    if (this._isDisposed) {
      throw new Error('Cannot load state into a disposed SimulationEngine instance');
    }

    // Enforce full domain invariant check
    validateSimulationState(newState as SimulationState);

    // Commit state
    this._state = newState;

    // Notify state listeners of state change
    for (const listener of this._stateListeners) {
      try {
        listener(this._state, []);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        this._handleListenerError(error, { listenerType: 'state' });
      }
    }
  }

  /**
   * Resets the simulation engine to a fresh initial game state.
   */
  public resetToNewGame(overrides?: InitialStateOverrides): void {
    const freshState = createInitialSimulationState(overrides);
    this.loadState(freshState);
  }

  /**
   * Dispatches a simulation command synchronously.
   * Validates command against current state, applies state transitions,
   * emits events, and isolates any listener exceptions.
   */
  public dispatch(command: SimulationCommand): CommandResult {
    if (this._isDisposed) {
      return {
        success: false,
        state: this._state,
        events: [],
        errorCode: 'INVALID_COMMAND',
        message: 'Cannot dispatch command to a disposed SimulationEngine instance',
      };
    }

    const result = handleCommand(this._state, command);

    if (result.success && !result.isNoOp) {
      // Commit the new state
      this._state = result.state;

      // Notify state subscribers (isolated)
      for (const listener of this._stateListeners) {
        try {
          listener(this._state, result.events);
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          this._handleListenerError(error, { listenerType: 'state' });
        }
      }

      // Notify specific event subscribers (isolated)
      for (const event of result.events) {
        const listenersForType = this._eventListeners.get(event.type);
        if (listenersForType) {
          for (const listener of listenersForType) {
            try {
              listener(event);
            } catch (err) {
              const error = err instanceof Error ? err : new Error(String(err));
              this._handleListenerError(error, {
                listenerType: 'event',
                eventType: event.type,
              });
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Subscribes to state updates and emitted events.
   * Returns an unsubscribe callback.
   */
  public subscribe(listener: StateListener): () => void {
    if (this._isDisposed) {
      return () => {};
    }
    this._stateListeners.add(listener);
    return () => {
      this._stateListeners.delete(listener);
    };
  }

  /**
   * Subscribes to a specific simulation event type.
   * Returns an unsubscribe callback.
   */
  public on(eventType: SimulationEventType, listener: EventListener): () => void {
    if (this._isDisposed) {
      return () => {};
    }
    let listeners = this._eventListeners.get(eventType);
    if (!listeners) {
      listeners = new Set();
      this._eventListeners.set(eventType, listeners);
    }
    listeners.add(listener);

    return () => {
      listeners?.delete(listener);
    };
  }

  /**
   * Returns the count of active state subscribers.
   */
  public get subscriberCount(): number {
    return this._stateListeners.size;
  }

  /**
   * Whether this engine instance has been disposed.
   */
  public get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Disposes the engine, unsubscribing all listeners and preventing further commands.
   */
  public dispose(): void {
    this._isDisposed = true;
    this._stateListeners.clear();
    this._eventListeners.clear();
  }

  private _handleListenerError(
    error: Error,
    context: { listenerType: 'state' | 'event'; eventType?: string }
  ): void {
    if (this._onListenerError) {
      try {
        this._onListenerError(error, context);
      } catch {
        // Prevent recursive errors in error handler
      }
    }
  }
}

/**
 * Factory helper to construct a new SimulationEngine.
 */
export function createSimulationEngine(options?: SimulationEngineOptions): SimulationEngine {
  return new SimulationEngine(options);
}
