export const FPS = 60

export interface WheelState {
  angle: number
  speed: number
  phase: Phase
  ticksInPhase: number
}

type Phase = 'demo' | 'accelerating' | 'constant' | 'decelerating' | 'stopped'
type WheelStateFn = (state: WheelState) => WheelState

const DEMO_SPEED = 0.005
const STOP_SPEED = 0.00015

export const initialWheelState: WheelState = {
  angle: 0,
  speed: DEMO_SPEED,
  phase: 'demo',
  ticksInPhase: 0
}

export const click = (state: WheelState): WheelState => {
  const handleClickForPhase: Record<Phase, WheelStateFn> = {
    demo: (state: WheelState) => goToPhase(state, 'accelerating'),
    accelerating: (state: WheelState) => state,
    constant: (state: WheelState) => goToDeceleratingPhase(state),
    decelerating: (state: WheelState) => state,
    stopped: (state: WheelState) => goToPhase(state, 'accelerating')
  }
  return handleClickForPhase[state.phase](state)
}

export const tick = (
  state: WheelState, spinTime: number, indefiniteSpin: boolean
): WheelState => {
  // Performance optimization: Avoid unnecessary object creation for stopped state
  if (state.phase === 'stopped') {
    // Just increase ticks without creating new object
    return { 
      ...state, 
      ticksInPhase: state.ticksInPhase + 1,
      speed: 0 // Ensure speed is exactly 0 when stopped
    };
  }
  
  // For demo phase, we can optimize to avoid extra object creations
  if (state.phase === 'demo') {
    let angle = state.angle + DEMO_SPEED;
    if (angle >= 2 * Math.PI) {
      angle -= 2 * Math.PI;
    }
    
    // Just return a modified state directly
    return {
      ...state,
      angle,
      speed: DEMO_SPEED,
      ticksInPhase: state.ticksInPhase + 1
    };
  }
  
  // For other phases, use the full processing logic
  const processTickForPhase: Record<Phase, WheelStateFn> = {
    demo: (state: WheelState) => ({ ...state, speed: DEMO_SPEED }),
    accelerating: (state: WheelState) => tickAcceleratingPhase(
      state, spinTime, indefiniteSpin
    ),
    constant: (state: WheelState) => state,
    decelerating: (state: WheelState) => tickDeceleratingPhase(state, spinTime),
    stopped: (state: WheelState) => ({ ...state, speed: 0 })
  }
  
  return increaseTicksInPhase(
    processTickForPhase[state.phase](
      increaseAngle(state)
    )
  )
}

const increaseAngle = (state: WheelState): WheelState => {
  // Performance optimization: Use modulo to avoid extra conditions & branches
  const angle = (state.angle + state.speed) % (2 * Math.PI);
  return { 
    ...state, 
    angle: angle < 0 ? angle + 2 * Math.PI : angle // Handle negative angles
  }
}

const increaseTicksInPhase = (state: WheelState): WheelState => {
  return { ...state, ticksInPhase: state.ticksInPhase + 1 }
}

const tickAcceleratingPhase = (
  state: WheelState, spinTime: number, indefiniteSpin: boolean
): WheelState => {
  if (state.ticksInPhase >= getAccelTicks(spinTime)) {
    if (indefiniteSpin) {
      return goToPhase(state, 'constant')
    }
    return goToDeceleratingPhase(state)
  }
  return { ...state, speed: state.speed + getAccelRate() }
}

const tickDeceleratingPhase = (
  state: WheelState, spinTime: number
): WheelState => {
  if (state.ticksInPhase >= getDecelTicks(spinTime)) {
    return goToPhase(state, 'stopped')
  }
  return { ...state, speed: state.speed * getDecelRate(spinTime) }
}

const goToDeceleratingPhase = (state: WheelState): WheelState => {
  return {
    ...state,
    angle: Math.random() * 2 * Math.PI,
    phase: 'decelerating',
    ticksInPhase: 0
  }
}

const goToPhase = (state: WheelState, phase: Phase): WheelState => {
  return { ...state, phase, ticksInPhase: 0 }
}

const getAccelTicks = (spinTime: number) => {
  return Math.min(FPS, Math.floor(spinTime * FPS / 3))
}

const getAccelRate = () => {
  return 0.6 / FPS
}

const getDecelTicks = (spinTime: number) => {
  return spinTime * FPS - getAccelTicks(spinTime)
}

const getDecelRate = (spinTime: number) => {
  return Math.exp(Math.log(
    STOP_SPEED / (DEMO_SPEED + getAccelTicks(spinTime) * getAccelRate())
  ) / getDecelTicks(spinTime))
}
