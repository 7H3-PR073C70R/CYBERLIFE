import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Polyfill window.WebGLRenderingContext and canvas.getContext for headless unit test environments
if (typeof window !== 'undefined') {
  // Mock WebGLRenderingContext
  class MockWebGLRenderingContext {}
  (window as unknown as { WebGLRenderingContext: unknown }).WebGLRenderingContext =
    MockWebGLRenderingContext;

  // Mock HTMLCanvasElement.prototype.getContext
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLCanvasElement.prototype.getContext = function (contextId: string, ..._args: unknown[]): any {
    if (contextId === 'webgl' || contextId === 'experimental-webgl') {
      return {};
    }
    return null;
  };

  // Mock ResizeObserver
  class MockResizeObserver implements ResizeObserver {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  window.ResizeObserver = MockResizeObserver;

  // Mock requestAnimationFrame / cancelAnimationFrame
  let frameCount = 0;
  window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    frameCount++;
    const id = frameCount;
    setTimeout(() => callback(performance.now()), 16);
    return id;
  });
  window.cancelAnimationFrame = vi.fn((_id: number) => {
    // cancelled
  });
}

// Mock Three.js WebGLRenderer for headless unit tests
vi.mock('three', async importOriginal => {
  const actual = await importOriginal<typeof import('three')>();

  class MockWebGLRenderer {
    domElement: HTMLCanvasElement;
    shadowMap = { enabled: false, type: 0 };

    constructor() {
      this.domElement = document.createElement('canvas');
      this.domElement.className = 'world-viewport-canvas';
    }

    setSize = vi.fn();
    setPixelRatio = vi.fn();
    render = vi.fn();
    dispose = vi.fn();
  }

  return {
    ...actual,
    WebGLRenderer: MockWebGLRenderer,
  };
});
