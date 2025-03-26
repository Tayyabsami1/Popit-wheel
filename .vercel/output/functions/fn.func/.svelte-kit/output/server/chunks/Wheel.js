class WheelConfig {
  title;
  description;
  colors;
  spinTime;
  displayWinnerDialog;
  winnerMessage;
  confetti;
  indefiniteSpin;
  duringSpinSound;
  duringSpinSoundVolume;
  afterSpinSound;
  afterSpinSoundVolume;
  image;
  hubSize;
  type;
  constructor(props) {
    this.title = props?.title ?? "";
    this.description = props?.description ?? "";
    this.colors = props?.colors ?? defaultColors;
    this.spinTime = props?.spinTime ?? 10;
    this.displayWinnerDialog = props?.displayWinnerDialog ?? true;
    this.winnerMessage = props?.winnerMessage ?? "";
    this.confetti = props?.confetti ?? "fireworks";
    this.indefiniteSpin = props?.indefiniteSpin ?? false;
    this.duringSpinSound = props?.duringSpinSound ?? "tick";
    this.duringSpinSoundVolume = props?.duringSpinSoundVolume ?? 0.5;
    this.afterSpinSound = props?.afterSpinSound ?? "SMALL_CROWD_APPLAUSE-Yannick_Lemieux-1268806408.mp3";
    this.afterSpinSoundVolume = props?.afterSpinSoundVolume ?? 0.5;
    this.image = props?.image ?? "";
    this.hubSize = props?.hubSize ?? "S";
    this.type = props?.type ?? "color";
  }
}
const wheelTypes = ["color", "image"];
const hubSizeKeys = ["XXS", "XS", "S", "M", "L", "XL"];
const hubSizes = {
  XXS: 0.05,
  XS: 0.1,
  S: 0.25,
  M: 0.33,
  L: 0.5,
  XL: 0.75
};
const defaultColors = ["#3369E8", "#D50F25", "#8E44AD", "#EEB211", "#009925"];
const confettiTypes = ["fireworks", "cannons", "stars", "off"];
const FPS = 60;
const DEMO_SPEED = 5e-3;
const STOP_SPEED = 15e-5;
const initialWheelState = {
  angle: 0,
  speed: DEMO_SPEED,
  phase: "demo",
  ticksInPhase: 0
};
const click = (state) => {
  const handleClickForPhase = {
    demo: (state2) => goToPhase(state2, "accelerating"),
    accelerating: (state2) => state2,
    constant: (state2) => goToDeceleratingPhase(state2),
    decelerating: (state2) => state2,
    stopped: (state2) => goToPhase(state2, "accelerating")
  };
  return handleClickForPhase[state.phase](state);
};
const tick = (state, spinTime, indefiniteSpin) => {
  const processTickForPhase = {
    demo: (state2) => ({ ...state2, speed: DEMO_SPEED }),
    accelerating: (state2) => tickAcceleratingPhase(
      state2,
      spinTime,
      indefiniteSpin
    ),
    constant: (state2) => state2,
    decelerating: (state2) => tickDeceleratingPhase(state2, spinTime),
    stopped: (state2) => ({ ...state2, speed: 0 })
  };
  return increaseTicksInPhase(
    processTickForPhase[state.phase](
      increaseAngle(state)
    )
  );
};
const increaseAngle = (state) => {
  let angle = state.angle + state.speed;
  if (angle >= 2 * Math.PI) {
    angle -= 2 * Math.PI;
  }
  return { ...state, angle };
};
const increaseTicksInPhase = (state) => {
  return { ...state, ticksInPhase: state.ticksInPhase + 1 };
};
const tickAcceleratingPhase = (state, spinTime, indefiniteSpin) => {
  if (state.ticksInPhase >= getAccelTicks(spinTime)) {
    if (indefiniteSpin) {
      return goToPhase(state, "constant");
    }
    return goToDeceleratingPhase(state);
  }
  return { ...state, speed: state.speed + getAccelRate() };
};
const tickDeceleratingPhase = (state, spinTime) => {
  if (state.ticksInPhase >= getDecelTicks(spinTime)) {
    return goToPhase(state, "stopped");
  }
  return { ...state, speed: state.speed * getDecelRate(spinTime) };
};
const goToDeceleratingPhase = (state) => {
  return {
    ...state,
    angle: Math.random() * 2 * Math.PI,
    phase: "decelerating",
    ticksInPhase: 0
  };
};
const goToPhase = (state, phase) => {
  return { ...state, phase, ticksInPhase: 0 };
};
const getAccelTicks = (spinTime) => {
  return Math.min(FPS, Math.floor(spinTime * FPS / 3));
};
const getAccelRate = () => {
  return 0.6 / FPS;
};
const getDecelTicks = (spinTime) => {
  return spinTime * FPS - getAccelTicks(spinTime);
};
const getDecelRate = (spinTime) => {
  return Math.exp(Math.log(
    STOP_SPEED / (DEMO_SPEED + getAccelTicks(spinTime) * getAccelRate())
  ) / getDecelTicks(spinTime));
};
class Wheel {
  config;
  state;
  entries;
  onStarted;
  onPointerIndexChanged;
  onStopped;
  constructor(props) {
    this.config = props?.config ?? new WheelConfig();
    this.state = props?.state ?? initialWheelState;
    this.entries = props?.entries ?? defaultEntries;
    this.onStarted = props?.onStarted;
    this.onPointerIndexChanged = props?.onPointerIndexChanged;
    this.onStopped = props?.onStopped;
  }
  click() {
    if (!this.entries.length) return;
    const oldState = this.state;
    const newState = click(this.state);
    if (this.onStarted && newState.phase !== oldState.phase && newState.phase === "accelerating") {
      this.onStarted();
    }
    this.state = newState;
  }
  tick() {
    const oldState = this.state;
    const newState = tick(
      oldState,
      this.config.spinTime,
      this.config.indefiniteSpin
    );
    if (this.onPointerIndexChanged) {
      const oldIndex = getIndexAtPointer({
        entries: this.entries,
        state: oldState
      });
      const newIndex = getIndexAtPointer({
        entries: this.entries,
        state: newState
      });
      if (newIndex !== oldIndex) {
        this.onPointerIndexChanged(newIndex);
      }
    }
    if (this.onStopped && newState.phase !== oldState.phase && newState.phase === "stopped") {
      this.onStopped({
        winner: getEntryAtPointer(this),
        color: getColorAtPointer(this)
      });
    }
    this.state = newState;
  }
  setConfig(config) {
    this.config = config;
  }
  setEntries(entries) {
    this.entries = entries;
  }
}
const getIndexAtPointer = (wheel) => {
  return Math.round(
    wheel.state.angle / (2 * Math.PI / (wheel.entries.length || 1))
  ) % (wheel.entries.length || 1);
};
const getEntryAtPointer = (wheel) => {
  return wheel.entries[getIndexAtPointer(wheel)];
};
const getColorAtPointer = (wheel) => {
  if (wheel.config.type === "image" || !wheel.config.colors.length) return null;
  return wheel.config.colors[getIndexAtPointer(wheel) % wheel.config.colors.length];
};
const addIdsToEntries = (entries) => {
  return entries.map((entry) => ({ ...entry, id: getNewEntryId() }));
};
const getNewEntryId = () => crypto.randomUUID().split("-")[0];
const defaultEntries = [
  "Ali",
  "Beatriz",
  "Charles",
  "Diya",
  "Eric",
  "Fatima",
  "Gabriel",
  "Hanna"
].map((text) => ({ text, id: getNewEntryId() }));
export {
  Wheel as W,
  addIdsToEntries as a,
  hubSizeKeys as b,
  confettiTypes as c,
  defaultColors as d,
  WheelConfig as e,
  defaultEntries as f,
  getNewEntryId as g,
  hubSizes as h,
  wheelTypes as w
};
