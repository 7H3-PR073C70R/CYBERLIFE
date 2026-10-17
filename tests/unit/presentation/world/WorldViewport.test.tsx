import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { WorldViewport } from '@/presentation/world/WorldViewport';
import { WorldSceneManager } from '@/presentation/world/WorldSceneManager';

describe('WorldViewport Component', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the viewport container element successfully', () => {
    render(<WorldViewport />);
    const viewportContainer = screen.getByTestId('world-viewport-container');
    expect(viewportContainer).toBeInTheDocument();
  });

  it('calls onInitialized when Three.js scene successfully starts', () => {
    const handleInitialized = vi.fn();
    render(<WorldViewport onInitialized={handleInitialized} />);
    expect(handleInitialized).toHaveBeenCalledTimes(1);
  });

  it('handles WebGL initialization failure gracefully with error UI and retry button', () => {
    vi.spyOn(WorldSceneManager, 'isWebGLAvailable').mockReturnValue(false);
    const handleError = vi.fn();

    render(<WorldViewport onError={handleError} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/3D Rendering Unavailable/i)).toBeInTheDocument();
    expect(screen.getByTestId('world-error-details')).toHaveTextContent(/WebGL is not available/i);
    expect(handleError).toHaveBeenCalled();

    // Verify retry button exists and is clickable
    const retryBtn = screen.getByRole('button', { name: /Retry 3D WebGL initialization/i });
    expect(retryBtn).toBeInTheDocument();

    // Now restore WebGL and click retry
    vi.spyOn(WorldSceneManager, 'isWebGLAvailable').mockReturnValue(true);
    fireEvent.click(retryBtn);

    // Error alert should now be dismissed
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls dispose on unmount to prevent WebGL resource and memory leaks', () => {
    const disposeSpy = vi.spyOn(WorldSceneManager.prototype, 'dispose');
    const { unmount } = render(<WorldViewport />);

    unmount();
    expect(disposeSpy).toHaveBeenCalled();
  });
});
