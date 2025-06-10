<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  import wheelStore from '$lib/stores/WheelStore'
  import busyStore from '$lib/stores/BusyStore.svelte'
  import Wheel, { type OnStoppedData } from '$lib/utils/Wheel'
  import Ticker from '$lib/utils/Ticker'
  import {
    playTick, playSound, playLoopedSound, cancelLoopingSounds
  } from '$lib/utils/Audio'
  import memoryManager from '$lib/utils/MemoryManager'

  const dispatch = createEventDispatcher<{ stop: OnStoppedData }>()

  const onStarted = () => {
    busyStore.spinning = true
    if (wheel.config.duringSpinSound === 'tick') {
      wheel.onPointerIndexChanged = () => {
        playTick(wheel.config.duringSpinSoundVolume)
      }
    } else {
      delete wheel.onPointerIndexChanged
      if (wheel.config.duringSpinSound) {
        playLoopedSound(
          wheel.config.duringSpinSound, wheel.config.duringSpinSoundVolume
        )
      }
    }
  }  // Handle stop event more efficiently to reduce UI freezing
  const onStopped = (data: OnStoppedData) => {
    // Immediate actions that affect the wheel
    busyStore.spinning = false
    cancelLoopingSounds()
    
    // Force immediate memory cleanup when wheel stops
    if (painter) {
      // Tell the worker to clear unnecessary caches
      painter.postMessage({ clearCache: true, cleanupLevel: 'deep' })
      
      // Clear any pending messages
      batchedUpdates.clear()
      
      // Schedule memory cleanup after spin completes
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          // Use memory manager to optimize wheel entries
          if (wheel.entries.length > 50) {
            wheel.setEntries(memoryManager.optimizeLargeArray(
              wheel.entries, ['id', 'text']
            ));
          }
          
          // Perform general memory cleanup
          memoryManager.cleanupNonEssentialMemory();
        }, { timeout: 200 })
      }
    }
    
    // Performance optimization: Split tasks into microtasks to avoid blocking the main thread
    queueMicrotask(() => {
      // Play sound in the first microtask
      if (wheel.config.afterSpinSound) {
        playSound(wheel.config.afterSpinSound, wheel.config.afterSpinSoundVolume)
      }
      
      // Use another microtask for dispatching event and updating state
      queueMicrotask(() => {
        dispatch('stop', data)
        wheelStore.winners = [...wheelStore.winners, data.winner]
      })
    })
  }

  let canvas: HTMLCanvasElement = $state(null!)
  let offscreen: OffscreenCanvas
  let painter: Worker = $state(null!)
  const wheel = new Wheel({ ...wheelStore, onStarted, onStopped })
  const ticker = new Ticker()
  let animationFrameId = 0

  // Memory management - track if component is mounted
  let isMounted = false;
  // Set more aggressive GC interval for memory management
  let gcInterval = 5000; // Run memory cleanup every 5 seconds
  let lastGCTime = 0;
  
  const loadWheelPainterWorker = async () => {
    const WheelPainterWorker = await import('$lib/utils/WheelPainterWorker?worker')
    painter = new WheelPainterWorker.default()
    offscreen = canvas.transferControlToOffscreen()
    
    // Transfer canvas ownership to the worker thread 
    painter.postMessage({ canvas: offscreen }, [offscreen])
    
    // Use a memory-optimized snapshot when initializing the worker
    const wheelSnapshot = {
      config: $state.snapshot(wheelStore.config),
      entries: wheel.entries.map(entry => ({ id: entry.id, text: entry.text })),
      state: { ...wheel.state }
    }
    
    painter.postMessage({ wheel: wheelSnapshot })
    
    // Listen for worker messages to respond to memory pressure
    painter.onmessage = (event) => {
      if (event.data.type === 'memoryPressure') {
        // Worker is under memory pressure, trigger cleanup
        forceClearMemory();
      }
    }
    
    refreshWheelOnFontLoad()
    tick(0)
  }
  
  // Function to aggressively clear memory
  const forceClearMemory = () => {
    // Clear any pending updates
    batchedUpdates.clear();
    
    // Tell worker to clear caches
    if (painter) {
      painter.postMessage({ clearCache: true });
    }
    
    // Reset the ticker to clear accumulated time
    ticker.reset();
    
    // Optimize wheel entries using memory manager
    if (wheel.entries.length > 0) {
      wheel.setEntries(memoryManager.optimizeLargeArray(
        wheel.entries, ['id', 'text']
      ));
    }
    
    // Let the memory manager perform additional cleanup
    memoryManager.cleanupNonEssentialMemory();
  }

  const refreshWheelOnFontLoad = async () => {
    try {
      // Load fonts with timeout to prevent hanging
      const fontPromise = document.fonts.load('16px Quicksand');
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
      
      // Race the font loading against a timeout
      await Promise.race([fontPromise, timeoutPromise]);
      
      if (isMounted && painter) {
        painter.postMessage({ refresh: true });
      }
    } catch (error) {
      console.warn('Font loading error:', error);
    }
  }
  onMount(() => {
    isMounted = true;
    loadWheelPainterWorker();
    
    // Register with memory manager
    memoryManager.registerCleanupCallback(() => {
      // Clear any pending updates
      batchedUpdates.clear();
      
      // Tell worker to clear caches if we're not currently spinning
      if (painter && wheel.state.phase === 'stopped') {
        painter.postMessage({ clearCache: true });
      }
      
      // Reset the ticker to clear accumulated time
      ticker.reset();
    });
    
    // Return cleanup function to be called on component destruction
    return () => {
      isMounted = false;
      
      // Cancel any pending animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }
      
      // Clean up audio resources
      cancelLoopingSounds();
      
      // Clean up event listeners
      if (painter) {
        painter.onmessage = null;
      }
      
      // Force cleanup of any remaining large objects
      batchedUpdates.clear();
      
      // Terminate worker to free resources
      if (painter) {
        painter.terminate();
        painter = null as unknown as Worker;
      }
    };
  })
  // Use a single batched update when config changes  // Optimize worker updates by scheduling a single update for config changes
  const scheduleUpdate = () => {
    if (updateScheduled || !isMounted || !painter) return;
    
    updateScheduled = true;
    
    // Use requestIdleCallback if available, or setTimeout as fallback
    const scheduleFunc = window.requestIdleCallback || setTimeout;
    
    scheduleFunc(() => {
      if (!isMounted) return;
      
      // Gather all batched updates into a single message
      const message = {};
      
      for (const [key, value] of batchedUpdates.entries()) {
        message[key] = value;
      }
      
      // Only send if we have updates
      if (Object.keys(message).length > 0) {
        painter.postMessage(message);
        batchedUpdates.clear();
      }
      
      updateScheduled = false;
    }, { timeout: 100 }); // Ensure update happens within 100ms max
  };

  $effect(() => {
    if (!isMounted || !painter) return;
    
    wheel.setConfig(wheelStore.config);
    
    // Store in batched updates instead of sending immediately
    batchedUpdates.set('config', $state.snapshot(wheel.config));
    batchedUpdates.set('refresh', true);
    
    // Schedule the update
    scheduleUpdate();
  })
  
  // Use a single batched update when entries change
  $effect(() => {
    if (!isMounted || !painter) return;
    
    wheel.setEntries(wheelStore.entries);
    
    // Store in batched updates instead of sending immediately
    batchedUpdates.set('entries', $state.snapshot(wheel.entries));
    batchedUpdates.set('refresh', true);
    
    // Schedule the update
    scheduleUpdate();
  })

  const click = (e: MouseEvent | KeyboardEvent) => {
    if (e instanceof MouseEvent) {
      const center = canvas.clientWidth / 2
      const { x, y } = { x: e.offsetX - center, y: e.offsetY - center }
      if ((x ** 2 + y ** 2) ** 0.5 > center * 0.85) return
    }
    if (e instanceof KeyboardEvent) {
      if (e.key !== 'Enter' && e.key !== ' ') return
    }
    wheel.click()
  }  // Keep track of the last angle we sent to the painter
  let lastSentAngle = 0;
  let lastTickTime = 0;
  let messageThrottle = 1000 / 30; // Limit worker messages to 30fps

  let frameSkipCounter = 0; // For adaptive frame skipping
  let updateScheduled = false; // Prevents duplicate scheduling
  let batchedUpdates = new Map(); // For aggregating updates
  

  const tick = (ms: number) => {
    if (!isMounted) return;
    
    const now = performance.now();
    
    // Memory management: Periodically trigger garbage collection
    if (now - lastGCTime > gcInterval && wheel.state.phase === 'stopped') {
      lastGCTime = now;
      
      // Force cleanup by setting references to null
      if (wheel.entries.length > 100) {
        // Create a clone with only essential properties to reduce memory usage
        const entries = wheel.entries.map(entry => ({ id: entry.id, text: entry.text }));
        wheel.setEntries(entries);
        
        // Clear image cache to free memory
        if (painter) {
          painter.postMessage({ clearCache: true });
        }
      }
      
      // Clear any unused batched updates
      batchedUpdates.clear();
      
      // Suggest garbage collection to browser
      if (window.gc) {
        try {
          window.gc();
        } catch (e) {
          // Ignore - only works in debug mode
        }
      }
    }
    
    // Process wheel physics with time-based limiting
    const previousAngle = wheel.state.angle;
    ticker.catchUp(ms, () => wheel.tick());
    
    // Memory optimization: Free any large temporary objects created during physics calculation
    if (ticker.accumulatedTime > 500) {
      // Clear any excess accumulated time if we're getting behind
      ticker.reset();
    }
    
    // Advanced performance optimization: Variable message throttling based on wheel state
    const currentPhase = wheel.state.phase;
    const isHighSpeed = wheel.state.speed > 0.5;
    
    // Dynamic frame skipping during high-speed phases
    // Skip more frames during fastest spinning to reduce UI thread load
    const shouldSkipFrame = isHighSpeed && (++frameSkipCounter % (isHighSpeed ? 3 : 2) !== 0);
    if (shouldSkipFrame && currentPhase !== 'demo' && currentPhase !== 'stopped') {
      animationFrameId = requestAnimationFrame(tick);
      return;
    }
    
    // Reset frame skip counter when needed
    if (!isHighSpeed) {
      frameSkipCounter = 0;
    }
    
    const messageRate = 
      currentPhase === 'demo' ? 1000/15 :  // Demo phase - 15fps is fine
      currentPhase === 'accelerating' ? 1000/60 : // Accelerating - need smooth 60fps
      currentPhase === 'constant' ? 1000/45 : // Constant - 45fps is enough for smoothness
      currentPhase === 'decelerating' ? 1000/30 : // Decelerating - 30fps is fine
      1000/5; // Stopped - 5fps is plenty when not moving
      
    // Performance optimization: Throttle messages to the worker
    const shouldSendMessage = 
      // Always send in demo mode for smooth movement
      currentPhase === 'demo' || 
      // Send if significant angle change from previous frame
      Math.abs(previousAngle - wheel.state.angle) > 0.001 ||
      // Send if accumulated changes are significant
      Math.abs(lastSentAngle - wheel.state.angle) > 0.01 ||
      // Send at least periodically for consistent updates
      (now - lastTickTime > messageRate);
      
    if (shouldSendMessage && painter) {
      // Bundle with any pending updates for efficiency
      const message = { angle: wheel.state.angle };
      
      // Add any batched updates to the current message
      if (batchedUpdates.size > 0) {
        for (const [key, value] of batchedUpdates.entries()) {
          message[key] = value;
        }
        batchedUpdates.clear();
      }
      
      // Optimize for phase transitions - ensure we don't miss important state changes
      if (wheel.state.phase !== currentPhase) {
        message.phaseChanged = wheel.state.phase;
      }
      
      painter.postMessage(message);
      lastSentAngle = wheel.state.angle;
      lastTickTime = now;
    }
    
    animationFrameId = requestAnimationFrame(tick);
  }
</script>

<div class="flex-1 aspect-square max-w-full wheel-container">
  <canvas
    width="700" 
    height="700"
    bind:this={canvas}
    onclick={click}
    onkeydown={click}
    class="w-full h-auto rounded-full outline-offset-[-1rem] gpu-accelerated"
    aria-label="Wheel"
    tabindex="0"
  ></canvas>
</div>

<style>
  .wheel-container {
    contain: content; /* CSS containment for performance */
  }
  
  .gpu-accelerated {
    will-change: transform;
    transform: translateZ(0); /* GPU acceleration hint for Safari */
    backface-visibility: hidden; /* Additional performance optimization */
    perspective: 1000; /* Helps with mobile GPU acceleration */
    -webkit-transform: translate3d(0, 0, 0); /* iOS specific optimization */
    -webkit-backface-visibility: hidden; /* iOS specific */
    -webkit-perspective: 1000; /* iOS specific */
    contain: paint; /* Additional CSS containment for rendering performance */
  }
</style>
