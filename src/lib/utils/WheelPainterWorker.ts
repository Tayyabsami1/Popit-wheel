import Wheel from '$lib/utils/Wheel'
import WheelPainter from '$lib/utils/WheelPainter'

let context: OffscreenCanvasRenderingContext2D
const painter = new WheelPainter()
let lastDrawTime = 0
let pendingDraw = false
let wheel = new Wheel()
let drawQueue = new Set<string>() // For tracking what needs to be redrawn
let rafId: number | null = null
let messageCounter = 0 // Count messages to limit processing frequency
let lastGCTime = 0
let gcInterval = 10000 // 10 seconds between GC operations

// Device-specific optimization - detect device capabilities
const isLowPerformanceDevice = () => {
  // Check for iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  // Check for older Android devices
  const isOldAndroid = /Android/.test(navigator.userAgent) && 
                      (/Android 4\./.test(navigator.userAgent) || /Android 5\./.test(navigator.userAgent));
  // Other low-performance indicators
  const isLowMemory = navigator.deviceMemory !== undefined && navigator.deviceMemory < 4;
  // Check for hardware concurrency - low core count devices likely need optimization
  const isLowConcurrency = navigator.hardwareConcurrency !== undefined && 
                           navigator.hardwareConcurrency <= 2;
  
  return isIOS || isOldAndroid || isLowMemory || isLowConcurrency;
}

// Configure painter based on device capabilities
const lowPerformanceMode = isLowPerformanceDevice();
if (lowPerformanceMode) {
  // Low-performance device optimizations
  painter.skipShadows = true;     // Skip shadows for better performance
  painter.frameThrottle = 1000/15; // Limit to 15fps on low-end devices
  painter.minAngleChange = 0.03;   // Higher threshold for redrawing
}

// Memory-efficient throttled draw function
const throttledDraw = () => {
  if (pendingDraw) {
    return; // Already scheduled a draw
  }
  
  pendingDraw = true;
  
  // Use requestAnimationFrame with callback optimization
  requestAnimationFrame(() => {
    const now = performance.now();
    // Use painter's frameThrottle setting
    if (now - lastDrawTime >= painter.frameThrottle) {
      painter.draw(context, wheel);
      lastDrawTime = now;
    }
    pendingDraw = false;
  });
};

onmessage = event => {  if ('canvas' in event.data) {
    context = (event.data.canvas as OffscreenCanvas).getContext('2d', {
      alpha: false, // Performance optimization - no transparency needed for full canvas
      desynchronized: true, // Reduce latency when available
      willReadFrequently: false, // Optimize for drawing instead of reading pixel data
    })!;
    
    // Apply performance optimizations to the context
    if (context) {
      // Disable image smoothing on lower performance devices
      if (lowPerformanceMode) {
        context.imageSmoothingEnabled = false;
      } else {
        // On high-performance devices, use medium quality for better performance
        context.imageSmoothingQuality = 'medium';
      }
      
      // Set reasonable defaults for performance
      context.miterLimit = 1; // Sharper corners = less work
    }  }
    // Batch operations to minimize repaints
  let needsRefresh = false;
  let needsDraw = false;
  let configChanged = false; // Track if config changed
  
  // Optimize message handling to reduce GC pressure and memory churn
  if ('wheel' in event.data) {
    const oldWheel = wheel; // Keep reference to potentially free
    wheel = new Wheel(event.data.wheel);
    needsRefresh = true;
    needsDraw = true;
    
    // Force removal of references to help GC
    if (oldWheel) {
      // Clean up references that might be holding memory
      oldWheel.onPointerIndexChanged = null as any;
      oldWheel.onStarted = null as any;
      oldWheel.onStopped = null as any;
    }
  }
  
  if ('angle' in event.data) {
    // Just update angle - very lightweight operation
    wheel.state.angle = event.data.angle;
    needsDraw = true;
  }
  
  if ('config' in event.data) {
    wheel.setConfig(event.data.config);
    configChanged = true;
    needsRefresh = true;
    needsDraw = true;
  }
  
  if ('entries' in event.data) {
    wheel.setEntries(event.data.entries);
    needsRefresh = true;
    needsDraw = true;
  }
  
  if ('refresh' in event.data) {
    needsRefresh = true;
    needsDraw = true;
  }
    // Performance optimization: stagger operations to prevent jank
  if (configChanged) {
    // Config changes are heavier - handle with care and adding delays
    setTimeout(() => {
      if (needsRefresh) {
        painter.refresh();
      }
      
      // Small delay before drawing to allow GC to run if needed
      setTimeout(() => {
        if (needsDraw) {
          throttledDraw();
        }
      }, 10);
    }, 0);
  } else {
    // For simpler operations, process immediately but ensure no duplicate calls
    if (needsRefresh) {
      painter.refresh();
    }
    
    if (needsDraw) {
      throttledDraw();
    }
  }
}
