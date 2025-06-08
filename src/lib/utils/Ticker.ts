import { FPS } from '$lib/utils/WheelState'

export default class Ticker {
  lastFrameTimeMs = 0
  delta = 0
  timestep = 1000 / FPS
  maxFrameThreshold = 200 // Prevent excessive catch-up after tab inactivity

  catchUp(ms: number, tick: () => void) {
    this.setTimestamp(ms)
    
    // Limit the number of ticks to prevent excessive CPU usage
    // if the app was in background or the animation stalled
    let ticks = 0
    const maxTicksPerFrame = 10
    
    while (this.shouldTick() && ticks < maxTicksPerFrame) {
      tick()
      ticks++
    }
    
    // If we're behind by too many frames, just reset
    if (this.delta > this.maxFrameThreshold) {
      this.delta = this.timestep
    }
  }

  setTimestamp(timestamp: number) {
    if (this.lastFrameTimeMs === 0) {
      this.delta = this.timestep
    } else {
      // Cap the maximum time between frames to prevent spiral of death
      const elapsed = Math.min(timestamp - this.lastFrameTimeMs, this.maxFrameThreshold)
      this.delta += elapsed
    }
    this.lastFrameTimeMs = timestamp
  }

  shouldTick() {
    const shouldTick = this.delta >= this.timestep
    if (shouldTick) {
      this.delta -= this.timestep
    }
    return shouldTick
  }
}
