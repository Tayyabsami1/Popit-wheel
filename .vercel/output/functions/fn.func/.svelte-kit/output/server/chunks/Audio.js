import { w as writable, g as get, r as readable } from "./index3.js";
import { B as BROWSER, W as getContext, R as setContext } from "./index.js";
import { e as WheelConfig, f as defaultEntries, g as getNewEntryId } from "./Wheel.js";
const browser = BROWSER;
const MODAL_STORE_KEY = "modalStore";
function getModalStore() {
  const modalStore = getContext(MODAL_STORE_KEY);
  if (!modalStore)
    throw new Error("modalStore is not initialized. Please ensure that `initializeStores()` is invoked in the root layout file of this app!");
  return modalStore;
}
function initializeModalStore() {
  const modalStore = modalService();
  return setContext(MODAL_STORE_KEY, modalStore);
}
function modalService() {
  const { subscribe, set, update } = writable([]);
  return {
    subscribe,
    set,
    update,
    /** Append to end of queue. */
    trigger: (modal) => update((mStore) => {
      mStore.push(modal);
      return mStore;
    }),
    /**  Remove first item in queue. */
    close: () => update((mStore) => {
      if (mStore.length > 0)
        mStore.shift();
      return mStore;
    }),
    /** Remove all items from queue. */
    clear: () => set([])
  };
}
const stores = {};
function localStorageStore(key, initialValue, options) {
  if (!stores[key]) {
    const store = writable(initialValue, (set2) => {
    });
    const { subscribe, set } = store;
    stores[key] = {
      set(value) {
        set(value);
      },
      update(updater) {
        const value = updater(get(store));
        set(value);
      },
      subscribe
    };
  }
  return stores[key];
}
localStorageStore("modeOsPrefers", false);
localStorageStore("modeUserPrefers", void 0);
const modeCurrent = localStorageStore("modeCurrent", false);
function setInitialClassState() {
  const elemHtmlClasses = document.documentElement.classList;
  const condLocalStorageUserPrefs = localStorage.getItem("modeUserPrefers") === "false";
  const condLocalStorageUserPrefsExists = !("modeUserPrefers" in localStorage);
  const condMatchMedia = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (condLocalStorageUserPrefs || condLocalStorageUserPrefsExists && condMatchMedia) {
    elemHtmlClasses.add("dark");
  } else {
    elemHtmlClasses.remove("dark");
  }
}
function prefersReducedMotion() {
  return false;
}
const prefersReducedMotionStore = readable(prefersReducedMotion(), (set) => {
});
function persistedState(key, initialValue, options = {}) {
  const {
    type = "localStorage",
    serializer = {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    },
    syncTabs = true,
    onReadError = console.error,
    onWriteError = console.error,
    beforeRead = (v) => v,
    beforeWrite = (v) => v
  } = options;
  const storage = null;
  let storedValue;
  try {
    const item = storage?.getItem(key);
    storedValue = item ? beforeRead(serializer.deserialize(item)) : initialValue;
  } catch (error) {
    onReadError(error);
    storedValue = initialValue;
  }
  let state = storedValue;
  if (syncTabs && browser && type === "localStorage") {
    addEventListener("storage", (event) => {
      if (event.key === key && event.storageArea === localStorage) {
        try {
          const newValue = event.newValue ? serializer.deserialize(event.newValue) : initialValue;
          state = beforeRead(newValue);
        } catch (error) {
          onReadError(error);
        }
      }
    });
  }
  return {
    get value() {
      return state;
    },
    set value(newValue) {
      state = newValue;
    },
    update(updateFn) {
      state = updateFn(state);
    },
    reset() {
      state = initialValue;
    }
  };
}
const createWheelStore = (state) => {
  const store = persistedState("wheel", state);
  const setNewEntries = (entries) => {
    store.update((state2) => {
      state2.entries = entries.map((entry) => ({ ...entry, id: getNewEntryId() }));
      return state2;
    });
  };
  return {
    get config() {
      return store.value.config;
    },
    set config(newValue) {
      store.value.config = newValue;
    },
    get entries() {
      return store.value.entries;
    },
    set entries(newValue) {
      store.value.entries = newValue;
    },
    get winners() {
      return store.value.winners;
    },
    set winners(newValue) {
      store.value.winners = newValue;
    },
    get path() {
      return store.value.path;
    },
    set path(newValue) {
      store.value.path = newValue;
    },
    reset: store.reset,
    setNewEntries
  };
};
const initialState = {
  config: new WheelConfig(),
  entries: defaultEntries,
  winners: [],
  path: null
};
const wheelStore = createWheelStore(initialState);
let loopingAudio = null;
const playTick = (volume) => {
  playSound("Tick-DeepFrozenApps-397275646.mp3", volume);
};
const playSound = (sound, volume) => {
  const audio = new Audio(`/audio/${sound}`);
  audio.volume = volume;
  audio.oncanplaythrough = audio.play;
};
const playLoopedSound = (sound, volume) => {
  loopingAudio = new Audio(`/audio/${sound}`);
  loopingAudio.volume = volume;
  loopingAudio.loop = true;
  loopingAudio.oncanplaythrough = loopingAudio.play;
};
const cancelLoopingSounds = () => {
  if (!loopingAudio) return;
  loopingAudio.pause();
  loopingAudio = null;
};
const duringSpinSounds = [
  { name: "Beyond the Cloudy Sky", file: "beyond-the-cloudy-sky-shutterstock.mp3" }
];
const afterSpinSounds = [
  { name: "Small Crowd Applause", file: "SMALL_CROWD_APPLAUSE-Yannick_Lemieux-1268806408.mp3" }
];
export {
  afterSpinSounds as a,
  playTick as b,
  playLoopedSound as c,
  duringSpinSounds as d,
  playSound as e,
  cancelLoopingSounds as f,
  getModalStore as g,
  initializeModalStore as i,
  modeCurrent as m,
  prefersReducedMotionStore as p,
  setInitialClassState as s,
  wheelStore as w
};
