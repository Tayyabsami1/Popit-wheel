<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  import wheelStore from '$lib/stores/WheelStore'
  import busyStore from '$lib/stores/BusyStore.svelte'
  import Wheel, { type OnStoppedData } from '$lib/utils/Wheel'
  import Ticker from '$lib/utils/Ticker'
  import {
    playTick, playSound, playLoopedSound, cancelLoopingSounds
  } from '$lib/utils/Audio'

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
  }
  const onStopped = (data: OnStoppedData) => {
    busyStore.spinning = false
    cancelLoopingSounds()
    if (wheel.config.afterSpinSound) {
      playSound(wheel.config.afterSpinSound, wheel.config.afterSpinSoundVolume)
    }
    dispatch('stop', data)
    wheelStore.winners = [...wheelStore.winners, data.winner]
  }
  let canvas: HTMLCanvasElement = $state(null!)
  let offscreen: OffscreenCanvas
  let painter: Worker = $state(null!)
  const wheel = new Wheel({ ...wheelStore, onStarted, onStopped })
  const ticker = new Ticker()
  let animationFrameId = 0
  let lastFrameTime = 0
  const frameRateLimit = 50 // Limit to 50fps instead of 60fps for better performance
  
  // Reset wheel state when done spinning to prevent memory/state buildup
  const resetWheelStateAfterStop = () => {
    // Clear any accumulated state that might cause performance degradation
    wheel.state = { ...wheel.state, ticksInPhase: 0 };
  }
  
  const loadWheelPainterWorker = async () => {
    if (painter) {
      // Clean up existing worker before creating a new one
      painter.terminate();
    }
    
    const WheelPainterWorker = await import('$lib/utils/WheelPainterWorker?worker')
    painter = new WheelPainterWorker.default()
    offscreen = canvas.transferControlToOffscreen()
    painter.postMessage({ canvas: offscreen }, [offscreen])
    painter.postMessage({ wheel: $state.snapshot(wheelStore) })
    refreshWheelOnFontLoad()
    
    // Start with a clean animation frame
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
    lastFrameTime = 0
    tick(0)
  }

  const refreshWheelOnFontLoad = async () => {
    await document.fonts.load('16px Quicksand')
    await document.fonts.ready
    painter?.postMessage({ refresh: true })
  }

  onMount(() => {
    loadWheelPainterWorker()
    
    // Clean up resources on component destruction
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      painter?.terminate()
    }
  })

  $effect(() => {
    wheel.setConfig(wheelStore.config)
    painter?.postMessage({ config: $state.snapshot(wheel.config) })
    painter?.postMessage({ refresh: true })
  })
  
  $effect(() => {
    wheel.setEntries(wheelStore.entries)
    painter?.postMessage({ entries: $state.snapshot(wheel.entries) })
    painter?.postMessage({ refresh: true })
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
    
    // Reset state when starting a new spin
    if (wheel.state.phase === 'stopped' || wheel.state.phase === 'demo') {
      resetWheelStateAfterStop();
    }
    
    wheel.click()
  }

  const tick = (timestamp: number) => {
    const elapsed = timestamp - lastFrameTime
    
    // Only process animation if enough time has passed (throttling to maintain consistent framerate)
    if (elapsed > 1000 / frameRateLimit || timestamp === 0) {
      ticker.catchUp(timestamp, () => wheel.tick())
      painter?.postMessage({ angle: wheel.state.angle })
      lastFrameTime = timestamp
      
      // Reset wheel state when it stops spinning
      if (wheel.state.phase === 'stopped' && wheel.state.ticksInPhase === 1) {
        resetWheelStateAfterStop();
      }
    }
    
    animationFrameId = requestAnimationFrame(tick)
  }
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
