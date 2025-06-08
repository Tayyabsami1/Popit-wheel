import Wheel from '$lib/utils/Wheel'
import WheelPainter from '$lib/utils/WheelPainter'

let context: OffscreenCanvasRenderingContext2D
const painter = new WheelPainter()

let wheel = new Wheel()
let lastAngle: number | null = null
let lastWheelState = '';
let pendingDraw = false;
let rafId: number | null = null;
let drawCount = 0;
const MEMORY_CLEANUP_THRESHOLD = 50; // Clean up painter's cache after 50 draws

// Optimize drawing with request animation frame to prevent too many draw calls
const scheduleNextDraw = () => {
  if (!pendingDraw) {
    pendingDraw = true;
    rafId = self.requestAnimationFrame(() => {
      painter.draw(context, wheel);
      pendingDraw = false;
      rafId = null;
      
      // Increment draw count and check if we should do memory cleanup
      drawCount++;
      if (drawCount >= MEMORY_CLEANUP_THRESHOLD) {
        performMemoryCleanup();
      }
    });
  }
};

// Periodically clean up resources to prevent memory leaks
const performMemoryCleanup = () => {
  // Reset the painter's cache periodically to prevent memory leaks
  painter.refresh();
  
  // Clean up memory that might accumulate in the wheel's state
  if (wheel.state.phase === 'stopped') {
    wheel.state = { 
      ...wheel.state,
      ticksInPhase: 0
    };
  }
  
  // Reset counter
  drawCount = 0;
};

// Clean resources
const cleanup = () => {
  if (rafId !== null) {
    self.cancelAnimationFrame(rafId);
    rafId = null;
  }
  pendingDraw = false;
};

onmessage = event => {
  if ('canvas' in event.data) {
    context = (event.data.canvas as OffscreenCanvas).getContext('2d', { alpha: false })!;
    // Set high quality settings for the canvas
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
  }
  
  if ('wheel' in event.data) {
    wheel = new Wheel(event.data.wheel);
    painter.refresh();
    scheduleNextDraw();
  }
  
  if ('angle' in event.data) {
    // Only update angle and redraw if the angle has changed significantly
    // This prevents excessive redraws for tiny angle changes
    const newAngle = event.data.angle;
    if (lastAngle === null || Math.abs(newAngle - lastAngle) > 0.0005) {
      wheel.state.angle = newAngle;
      lastAngle = newAngle;
      scheduleNextDraw();
    }
  }
  
  if ('config' in event.data) {
    wheel.setConfig(event.data.config);
    painter.refresh();
    scheduleNextDraw();
  }
  
  if ('entries' in event.data) {
    wheel.setEntries(event.data.entries);
    painter.refresh();
    scheduleNextDraw();
  }
  
  if ('refresh' in event.data) {
    painter.refresh();
    scheduleNextDraw();
  }
  
  if ('cleanup' in event.data) {
    cleanup();
  }
}
