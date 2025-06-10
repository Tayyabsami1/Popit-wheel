import { FPS } from '$lib/utils/WheelState'

export default class Ticker {
  lastFrameTimeMs = 0
  delta = 0
  timestep = 1000 / FPS
  maxDelta = 1000; // Cap delta to prevent performance issues after tab inactivity
  
  catchUp(ms: number, tick: () => void) {
    this.setTimestamp(ms)
    
    // Limit number of ticks per frame to prevent CPU spikes
    let ticksThisFrame = 0;
    const maxTicksPerFrame = 10; // Safety limit
    
    while (this.shouldTick() && ticksThisFrame < maxTicksPerFrame) {
      tick()
      ticksThisFrame++;
    }
    
    // If we hit the limit, reset delta to avoid catching up forever
    if (ticksThisFrame >= maxTicksPerFrame) {
      this.delta = 0;
    }
  }

  setTimestamp(timestamp: number) {
    if (this.lastFrameTimeMs === 0) {
      this.delta = this.timestep
    } else {
      // Cap delta to prevent huge jumps after tab inactivity
      const elapsed = timestamp - this.lastFrameTimeMs;
      this.delta += Math.min(elapsed, this.maxDelta);
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
  
  reset() {
    this.lastFrameTimeMs = 0;
    this.delta = 0;
  }
}
