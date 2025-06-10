<script lang="ts">
  import { animateBalloons } from "$lib/utils/animations";
  import { startAnimation } from "$lib/utils/balloonPopup";
  import { onMount, createEventDispatcher } from "svelte";
  import wheelStore from "$lib/stores/WheelStore";
  import busyStore from "$lib/stores/BusyStore.svelte";
  import Wheel, { type OnStoppedData } from "$lib/utils/Wheel";
  import WheelPainter from "$lib/utils/WheelPainter";
  import Ticker from "$lib/utils/Ticker";
  import {
    playTick,
    playSound,
    playLoopedSound,
    cancelLoopingSounds,
  } from "$lib/utils/Audio";

  const dispatch = createEventDispatcher<{ stop: OnStoppedData }>();

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;

  let isSpinning = false;
  let rafId: number;

  const painter = new WheelPainter();
  const ticker = new Ticker();

  const onStarted = () => {
    busyStore.spinning = true;
    isSpinning = true;
    ticker.lastFrameTimeMs = 0;
    ticker.delta = 0;
    animateBalloons();

    //  ticker.reset();

    if (wheel.config.duringSpinSound === "tick") {
      wheel.onPointerIndexChanged = () => {
        playTick(wheel.config.duringSpinSoundVolume);
      };
    } else {
      delete wheel.onPointerIndexChanged;
      if (wheel.config.duringSpinSound) {
        playLoopedSound(
          wheel.config.duringSpinSound,
          wheel.config.duringSpinSoundVolume,
        );
      }
    }

    rafId = requestAnimationFrame(tick); // Start spinning animation
  };

  const onStopped = async (data: OnStoppedData) => {
    cancelLoopingSounds();
    await startAnimation();
    busyStore.spinning = false;
    cancelAnimationFrame(rafId);
    isSpinning = false;

    if (wheel.config.afterSpinSound) {
      playSound(wheel.config.afterSpinSound, wheel.config.afterSpinSoundVolume);
    }

    dispatch("stop", data);
    wheelStore.winners = [...wheelStore.winners, data.winner];

    painter.refresh();
    painter.draw(context, wheel);
  };

  const wheel = new Wheel({ ...wheelStore, onStarted, onStopped }); // This must come after

  const refreshPainter = () => {
    painter.refresh();
    if (context) {
      painter.draw(context, wheel);
    }
  };

  const refreshPainterOnFontLoad = async () => {
    try {
      if (document.fonts.status !== "loaded") {
        await document.fonts.ready;
      }
      refreshPainter();
    } catch (e) {
      console.warn("Font load error:", e);
    }
  };

  onMount(() => {
    // Use alpha: false for better performance
    context = canvas.getContext("2d", { alpha: false })!;
    
    // iOS Safari specific optimizations
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (isIOS && context) {
      // Disable image smoothing on iOS - speeds up drawing
      context.imageSmoothingEnabled = false;
      // Skip shadows on iOS for better performance
      painter.skipShadows = true;
    }
    
    if (document.fonts.status === "loaded") {
      refreshPainter();
    } else {
      refreshPainterOnFontLoad();
    }
    
    // Return cleanup function to be called on component destruction
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      // Clear caches to prevent memory leaks
      painter.imageCache.clear();
      painter.fontPicker.clearFontCache();
    };
  });

  $: wheel.setConfig(wheelStore.config), refreshPainter();
  $: wheel.setEntries(wheelStore.entries), refreshPainter();

  const click = (e: MouseEvent | KeyboardEvent) => {
    if (e instanceof MouseEvent) {
      const center = canvas.width / 2; // fixed: use canvas width instead of clientWidth
      const { x, y } = {
        x: e.offsetX - center,
        y: e.offsetY - center,
      };
      if ((x ** 2 + y ** 2) ** 0.5 > center * 0.85) return;
    }

    if (e instanceof KeyboardEvent) {
      if (!["Enter", " "].includes(e.key)) return;
      e.preventDefault();
    }

    wheel.click();
  };
  const tick = (ms: number) => {
    if (!isSpinning) return;
    
    // Process wheel physics
    const previousAngle = wheel.state.angle;
    ticker.catchUp(ms, () => wheel.tick());
    
    // Only redraw if the angle changed significantly or we're in demo phase
    // This reduces unnecessary redraws during very slow motion
    if (Math.abs(previousAngle - wheel.state.angle) > 0.001 || wheel.state.phase === 'demo') {
      painter.draw(context, wheel);
    }
    
    rafId = requestAnimationFrame(tick); // store ID for later cancel
  };
</script>

<div class="flex-1 aspect-square max-w-full">
  <canvas
    width="700"
    height="700"
    bind:this={canvas}
    onclick={click}
    onkeydown={click}
    class="w-full h-auto rounded-full outline-offset-[-1rem]"
    aria-label="Wheel"
    tabindex="0"
  ></canvas>
</div>

<style>
  canvas {
    /* will-change: transform; */
    transform: translateZ(0); /* GPU acceleration hint for Safari */
    backface-visibility: hidden; /* Additional performance optimization */
    perspective: 1000; /* Helps with mobile GPU acceleration */
    -webkit-transform: translate3d(0, 0, 0); /* iOS specific optimization */
    -webkit-backface-visibility: hidden; /* iOS specific */
    -webkit-perspective: 1000; /* iOS specific */
  }
</style>