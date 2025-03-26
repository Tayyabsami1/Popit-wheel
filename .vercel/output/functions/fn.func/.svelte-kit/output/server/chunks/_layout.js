import { q as is_array, T as get_prototype_of, V as object_prototype, R as setContext, W as getContext, X as rest_props, Q as push, Y as fallback, Z as spread_attributes, _ as stringify, $ as attr, a0 as escape_html, a1 as slot, a2 as bind_props, S as pop, a3 as sanitize_props, a4 as sanitize_slots, a5 as ensure_array_like, a6 as store_get, a7 as unsubscribe_stores, a8 as spread_props, a9 as clsx, aa as copy_payload, ab as assign_payload, ac as head, ad as await_block } from "./index.js";
import { o as onNavigate } from "./client.js";
import { w as writable } from "./index3.js";
import { i as initializeModalStore, g as getModalStore, p as prefersReducedMotionStore, w as wheelStore, d as duringSpinSounds, a as afterSpinSounds } from "./Audio.js";
import { h as html, T as TabGroup, a as Tab } from "./Tab.js";
import { computePosition, autoUpdate, flip, shift, offset, arrow } from "@floating-ui/dom";
import { g as getTextColor } from "./FontPicker.js";
import "browser-fs-access";
import { g as getCurrentUser, s as signIn, r as registerUser, P as PUBLIC_FIREBASE_MEASUREMENT_ID } from "./Firebase.js";
import "firebase/app";
import "./Schemas.js";
import { h as hubSizes, c as confettiTypes } from "./Wheel.js";
const empty = [];
function snapshot(value, skip_warning = false) {
  return clone(value, /* @__PURE__ */ new Map(), "", empty);
}
function clone(value, cloned, path, paths, original = null) {
  if (typeof value === "object" && value !== null) {
    var unwrapped = cloned.get(value);
    if (unwrapped !== void 0) return unwrapped;
    if (value instanceof Map) return (
      /** @type {Snapshot<T>} */
      new Map(value)
    );
    if (value instanceof Set) return (
      /** @type {Snapshot<T>} */
      new Set(value)
    );
    if (is_array(value)) {
      var copy = (
        /** @type {Snapshot<any>} */
        Array(value.length)
      );
      cloned.set(value, copy);
      if (original !== null) {
        cloned.set(original, copy);
      }
      for (var i = 0; i < value.length; i += 1) {
        var element = value[i];
        if (i in value) {
          copy[i] = clone(element, cloned, path, paths);
        }
      }
      return copy;
    }
    if (get_prototype_of(value) === object_prototype) {
      copy = {};
      cloned.set(value, copy);
      if (original !== null) {
        cloned.set(original, copy);
      }
      for (var key in value) {
        copy[key] = clone(value[key], cloned, path, paths);
      }
      return copy;
    }
    if (value instanceof Date) {
      return (
        /** @type {Snapshot<T>} */
        structuredClone(value)
      );
    }
    if (typeof /** @type {T & { toJSON?: any } } */
    value.toJSON === "function") {
      return clone(
        /** @type {T & { toJSON(): any } } */
        value.toJSON(),
        cloned,
        path,
        paths,
        // Associate the instance with the toJSON clone
        value
      );
    }
  }
  if (value instanceof EventTarget) {
    return (
      /** @type {Snapshot<T>} */
      value
    );
  }
  try {
    return (
      /** @type {Snapshot<T>} */
      structuredClone(value)
    );
  } catch (e) {
    return (
      /** @type {Snapshot<T>} */
      value
    );
  }
}
const pwaInfo = { "pwaInDevEnvironment": false, "webManifest": { "href": "/manifest.webmanifest", "useCredentials": false, "linkTag": '<link rel="manifest" href="/manifest.webmanifest">' } };
const storePopup = writable(void 0);
const DRAWER_STORE_KEY = "drawerStore";
function initializeDrawerStore() {
  const drawerStore = drawerService();
  return setContext(DRAWER_STORE_KEY, drawerStore);
}
function drawerService() {
  const { subscribe, set, update } = writable({});
  return {
    subscribe,
    set,
    update,
    /** Open the drawer. */
    open: (newSettings) => update(() => {
      return { open: true, ...newSettings };
    }),
    /** Close the drawer. */
    close: () => update((d) => {
      d.open = false;
      return d;
    })
  };
}
const toastDefaults$1 = { message: "Missing Toast Message", autohide: true, timeout: 5e3 };
const TOAST_STORE_KEY = "toastStore";
function getToastStore() {
  const toastStore = getContext(TOAST_STORE_KEY);
  if (!toastStore)
    throw new Error("toastStore is not initialized. Please ensure that `initializeStores()` is invoked in the root layout file of this app!");
  return toastStore;
}
function initializeToastStore() {
  const toastStore = toastService();
  return setContext(TOAST_STORE_KEY, toastStore);
}
function randomUUID() {
  const random = Math.random();
  return Number(random).toString(32);
}
function toastService() {
  const { subscribe, set, update } = writable([]);
  const close = (id) => update((tStore) => {
    if (tStore.length > 0) {
      const index = tStore.findIndex((t) => t.id === id);
      const selectedToast = tStore[index];
      if (selectedToast) {
        if (selectedToast.callback)
          selectedToast.callback({ id, status: "closed" });
        if (selectedToast.timeoutId)
          clearTimeout(selectedToast.timeoutId);
        tStore.splice(index, 1);
      }
    }
    return tStore;
  });
  function handleAutoHide(toast) {
    if (toast.autohide === true) {
      return setTimeout(() => {
        close(toast.id);
      }, toast.timeout);
    }
  }
  return {
    subscribe,
    close,
    /** Add a new toast to the queue. */
    trigger: (toast) => {
      const id = randomUUID();
      update((tStore) => {
        if (toast && toast.callback)
          toast.callback({ id, status: "queued" });
        if (toast.hideDismiss)
          toast.autohide = true;
        const tMerged = { ...toastDefaults$1, ...toast, id };
        tMerged.timeoutId = handleAutoHide(tMerged);
        tStore.push(tMerged);
        return tStore;
      });
      return id;
    },
    /** Remain visible on hover */
    freeze: (index) => update((tStore) => {
      if (tStore.length > 0)
        clearTimeout(tStore[index].timeoutId);
      return tStore;
    }),
    /** Cancel remain visible on leave */
    unfreeze: (index) => update((tStore) => {
      if (tStore.length > 0)
        tStore[index].timeoutId = handleAutoHide(tStore[index]);
      return tStore;
    }),
    /** Remove all toasts from queue */
    clear: () => set([])
  };
}
function initializeStores() {
  initializeModalStore();
  initializeToastStore();
  initializeDrawerStore();
}
function cubic_out(t) {
  const f = t - 1;
  return f * f * f + 1;
}
function split_css_unit(value) {
  const split = typeof value === "string" && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
  return split ? [parseFloat(split[1]), split[2] || "px"] : [
    /** @type {number} */
    value,
    "px"
  ];
}
function fly(node, { delay = 0, duration = 400, easing = cubic_out, x = 0, y = 0, opacity = 0 } = {}) {
  const style = getComputedStyle(node);
  const target_opacity = +style.opacity;
  const transform = style.transform === "none" ? "" : style.transform;
  const od = target_opacity * (1 - opacity);
  const [x_value, x_unit] = split_css_unit(x);
  const [y_value, y_unit] = split_css_unit(y);
  return {
    delay,
    duration,
    easing,
    css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x_value}${x_unit}, ${(1 - t) * y_value}${y_unit});
			opacity: ${target_opacity - od * u}`
  };
}
function Avatar($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "initials",
    "fill",
    "fontSize",
    "src",
    "fallback",
    "action",
    "actionParams",
    "background",
    "width",
    "border",
    "rounded",
    "shadow",
    "cursor"
  ]);
  push();
  let classesBase;
  let initials = fallback($$props["initials"], "");
  let fill = fallback($$props["fill"], "fill-token");
  let fontSize = fallback($$props["fontSize"], 150);
  let src = fallback($$props["src"], "");
  let fallback$1 = fallback($$props["fallback"], "");
  let action = fallback($$props["action"], () => {
  });
  let actionParams = fallback($$props["actionParams"], "");
  let background = fallback($$props["background"], "bg-surface-400-500-token");
  let width = fallback($$props["width"], "w-16");
  let border = fallback($$props["border"], "");
  let rounded = fallback($$props["rounded"], "rounded-full");
  let shadow = fallback($$props["shadow"], "");
  let cursor = fallback($$props["cursor"], "");
  let cBase = "flex aspect-square text-surface-50 font-semibold justify-center items-center overflow-hidden isolate";
  let cImage = "w-full object-cover";
  function prunedRestProps() {
    delete $$restProps.class;
    return $$restProps;
  }
  classesBase = `${cBase} ${background} ${width} ${border} ${rounded} ${shadow} ${cursor} ${$$sanitized_props.class ?? ""}`;
  $$payload.out += `<figure${spread_attributes({
    class: `avatar ${stringify(classesBase)}`,
    "data-testid": "avatar",
    ...prunedRestProps()
  })}>`;
  if (src || fallback$1) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<img${attr("class", `avatar-image ${stringify(cImage)}`)}${attr("style", $$sanitized_props.style ?? "")}${attr("src", src)}${attr("alt", $$sanitized_props.alt || "")} onload="this.__e=event" onerror="this.__e=event">`;
  } else {
    $$payload.out += "<!--[!-->";
    if (initials) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<svg class="avatar-initials w-full h-full" viewBox="0 0 512 512"><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-weight="bold"${attr("font-size", fontSize)}${attr("class", `avatar-text ${stringify(fill)}`)}>${escape_html(String(initials).substring(0, 2).toUpperCase())}</text></svg>`;
    } else {
      $$payload.out += "<!--[!-->";
      $$payload.out += `<!---->`;
      slot($$payload, $$props, "default", {});
      $$payload.out += `<!---->`;
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]--></figure>`;
  bind_props($$props, {
    initials,
    fill,
    fontSize,
    src,
    fallback: fallback$1,
    action,
    actionParams,
    background,
    width,
    border,
    rounded,
    shadow,
    cursor
  });
  pop();
}
function RadioGroup($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  push();
  let classesBase;
  let display = fallback($$props["display"], "inline-flex");
  let flexDirection = fallback($$props["flexDirection"], "flex-row");
  let gap = fallback($$props["gap"], "gap-1");
  let background = fallback($$props["background"], "bg-surface-200-700-token");
  let border = fallback($$props["border"], "border-token border-surface-400-500-token");
  let rounded = fallback($$props["rounded"], "rounded-token");
  let padding = fallback($$props["padding"], "px-4 py-1");
  let active = fallback($$props["active"], "variant-filled");
  let hover = fallback($$props["hover"], "hover:variant-soft");
  let color = fallback($$props["color"], "");
  let fill = fallback($$props["fill"], "");
  let regionLabel = fallback($$props["regionLabel"], "");
  let labelledby = fallback($$props["labelledby"], "");
  setContext("rounded", rounded);
  setContext("padding", padding);
  setContext("active", active);
  setContext("hover", hover);
  setContext("color", color);
  setContext("fill", fill);
  setContext("regionLabel", regionLabel);
  const cBase = "p-1";
  classesBase = `${cBase} ${display} ${flexDirection} ${gap} ${background} ${border} ${rounded} ${$$sanitized_props.class ?? ""}`;
  $$payload.out += `<div${attr("class", `radio-group ${stringify(classesBase)}`)} data-testid="radio-group" role="radiogroup"${attr("aria-labelledby", labelledby)}><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></div>`;
  bind_props($$props, {
    display,
    flexDirection,
    gap,
    background,
    border,
    rounded,
    padding,
    active,
    hover,
    color,
    fill,
    regionLabel,
    labelledby
  });
  pop();
}
function RadioItem($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "group",
    "name",
    "value",
    "title",
    "label",
    "rounded",
    "padding",
    "active",
    "hover",
    "color",
    "fill",
    "regionLabel"
  ]);
  push();
  let checked, classesActive, classesDisabled, classsBase, classesWrapper;
  let group = $$props["group"];
  let name = $$props["name"];
  let value = $$props["value"];
  let title = fallback($$props["title"], "");
  let label = fallback($$props["label"], "");
  let rounded = fallback($$props["rounded"], () => getContext("rounded"), true);
  let padding = fallback($$props["padding"], () => getContext("padding"), true);
  let active = fallback($$props["active"], () => getContext("active"), true);
  let hover = fallback($$props["hover"], () => getContext("hover"), true);
  let color = fallback($$props["color"], () => getContext("color"), true);
  let fill = fallback($$props["fill"], () => getContext("fill"), true);
  let regionLabel = fallback($$props["regionLabel"], () => getContext("regionLabel"), true);
  const cBase = "flex-auto";
  const cWrapper = "text-base text-center cursor-pointer";
  const cDisabled = "opacity-50 cursor-not-allowed";
  function prunedRestProps() {
    delete $$restProps.class;
    return $$restProps;
  }
  checked = value === group;
  classesActive = checked ? `${active} ${color} ${fill}` : hover;
  classesDisabled = $$sanitized_props.disabled ? cDisabled : "";
  classsBase = `${cBase}`;
  classesWrapper = `${cWrapper} ${padding} ${rounded} ${classesActive} ${classesDisabled} ${$$sanitized_props.class ?? ""}`;
  $$payload.out += `<label${attr("class", `radio-label ${stringify(classsBase)} ${stringify(regionLabel)}`)}><div${attr("class", `radio-item ${stringify(classesWrapper)}`)} data-testid="radio-item" role="radio"${attr("aria-checked", checked)}${attr("aria-label", label)} tabindex="0"${attr("title", title)}><div class="h-0 w-0 overflow-hidden"><input${spread_attributes({
    type: "radio",
    checked: group === value,
    name,
    value,
    ...prunedRestProps(),
    tabindex: "-1"
  })}></div> <!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></div></label>`;
  bind_props($$props, {
    group,
    name,
    value,
    title,
    label,
    rounded,
    padding,
    active,
    hover,
    color,
    fill,
    regionLabel
  });
  pop();
}
function RangeSlider($$payload, $$props) {
  const $$slots = sanitize_slots($$props);
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "name",
    "id",
    "value",
    "min",
    "max",
    "step",
    "ticked",
    "accent",
    "label"
  ]);
  push();
  let classesBase, classesInput;
  let name = $$props["name"];
  let id = fallback($$props["id"], () => String(Math.random()), true);
  let value = fallback($$props["value"], 0);
  let min = fallback($$props["min"], 0);
  let max = fallback($$props["max"], 100);
  let step = fallback($$props["step"], 1);
  let ticked = fallback($$props["ticked"], false);
  let accent = fallback($$props["accent"], "accent-surface-900 dark:accent-surface-50");
  let label = fallback($$props["label"], "");
  const cBase = "space-y-2";
  const cBaseLabel = "";
  const cBaseContent = "flex justify-center py-2";
  const cBaseInput = "w-full h-2";
  let tickmarks;
  function setTicks() {
    if (ticked == false) return;
    tickmarks = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  }
  if (ticked) setTicks();
  function prunedRestProps() {
    delete $$restProps.class;
    return $$restProps;
  }
  classesBase = `${cBase} ${$$sanitized_props.class ?? ""}`;
  classesInput = `${cBaseInput} ${accent}`;
  $$payload.out += `<div${attr("class", `range-slider ${stringify(classesBase)}`)} data-testid="range-slider">`;
  if ($$slots.default) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<label${attr("class", `range-slider-label ${stringify(cBaseLabel)}`)}${attr("for", id)}><!---->`;
    slot($$payload, $$props, "default", {});
    $$payload.out += `<!----></label>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <div${attr("class", `range-content ${stringify(cBaseContent)}`)}><input${spread_attributes({
    type: "range",
    id,
    name,
    class: `range-slider-input ${stringify(classesInput)}`,
    list: `tickmarks-${stringify(id)}`,
    "aria-label": label,
    min,
    max,
    step,
    value,
    ...prunedRestProps()
  })}> `;
  if (ticked && tickmarks && tickmarks.length) {
    $$payload.out += "<!--[-->";
    const each_array = ensure_array_like(tickmarks);
    $$payload.out += `<datalist${attr("id", `tickmarks-${stringify(id)}`)} class="range-slider-ticks"><!--[-->`;
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tm = each_array[$$index];
      $$payload.out += `<option${attr("value", tm)}${attr("label", tm)}></option>`;
    }
    $$payload.out += `<!--]--></datalist>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div> `;
  if ($$slots.trail) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="range-slider-trail"><!---->`;
    slot($$payload, $$props, "trail", {});
    $$payload.out += `<!----></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div>`;
  bind_props($$props, {
    name,
    id,
    value,
    min,
    max,
    step,
    ticked,
    accent,
    label
  });
  pop();
}
function Modal($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  push();
  var $$store_subs;
  let cPosition, classesBackdrop, classesTransitionLayer, classesModal, parent;
  let components = fallback($$props["components"], () => ({}), true);
  let position = fallback($$props["position"], "items-center");
  let background = fallback($$props["background"], "bg-surface-100-800-token");
  let width = fallback($$props["width"], "w-modal");
  let height = fallback($$props["height"], "h-auto");
  let padding = fallback($$props["padding"], "p-4");
  let spacing = fallback($$props["spacing"], "space-y-4");
  let rounded = fallback($$props["rounded"], "rounded-container-token");
  let shadow = fallback($$props["shadow"], "shadow-xl");
  let zIndex = fallback($$props["zIndex"], "z-[999]");
  let buttonNeutral = fallback($$props["buttonNeutral"], "variant-ghost-surface");
  let buttonPositive = fallback($$props["buttonPositive"], "variant-filled");
  let buttonTextCancel = fallback($$props["buttonTextCancel"], "Cancel");
  let buttonTextConfirm = fallback($$props["buttonTextConfirm"], "Confirm");
  let buttonTextSubmit = fallback($$props["buttonTextSubmit"], "Submit");
  let regionBackdrop = fallback($$props["regionBackdrop"], "");
  let regionHeader = fallback($$props["regionHeader"], "text-2xl font-bold");
  let regionBody = fallback($$props["regionBody"], "max-h-[200px] overflow-hidden");
  let regionFooter = fallback($$props["regionFooter"], "flex justify-end space-x-2");
  let transitions = fallback($$props["transitions"], () => !store_get($$store_subs ??= {}, "$prefersReducedMotionStore", prefersReducedMotionStore), true);
  let transitionIn = fallback($$props["transitionIn"], fly);
  let transitionInParams = fallback($$props["transitionInParams"], () => ({ duration: 150, opacity: 0, x: 0, y: 100 }), true);
  let transitionOut = fallback($$props["transitionOut"], fly);
  let transitionOutParams = fallback($$props["transitionOutParams"], () => ({ duration: 150, opacity: 0, x: 0, y: 100 }), true);
  const cBackdrop = "fixed top-0 left-0 right-0 bottom-0 bg-surface-backdrop-token p-4";
  const cTransitionLayer = "w-full h-fit min-h-full overflow-y-auto flex justify-center";
  const cModal = "block overflow-y-auto";
  const cModalImage = "w-full h-auto";
  let promptValue;
  const buttonTextDefaults = {
    buttonTextCancel,
    buttonTextConfirm,
    buttonTextSubmit
  };
  let currentComponent;
  let modalElement;
  let windowHeight;
  let backdropOverflow = "overflow-y-hidden";
  const modalStore = getModalStore();
  function handleModals(modals) {
    if (modals[0].type === "prompt") promptValue = modals[0].value;
    buttonTextCancel = modals[0].buttonTextCancel || buttonTextDefaults.buttonTextCancel;
    buttonTextConfirm = modals[0].buttonTextConfirm || buttonTextDefaults.buttonTextConfirm;
    buttonTextSubmit = modals[0].buttonTextSubmit || buttonTextDefaults.buttonTextSubmit;
    currentComponent = typeof modals[0].component === "string" ? components[modals[0].component] : modals[0].component;
  }
  function onModalHeightChange(modal) {
    let modalHeight = modal?.clientHeight;
    if (!modalHeight) modalHeight = modal?.firstChild?.clientHeight;
    if (!modalHeight) return;
    if (modalHeight > windowHeight) {
      backdropOverflow = "overflow-y-auto";
    } else {
      backdropOverflow = "overflow-y-hidden";
    }
  }
  function onClose() {
    if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].response) store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].response(false);
    modalStore.close();
  }
  if (store_get($$store_subs ??= {}, "$modalStore", modalStore).length) handleModals(store_get($$store_subs ??= {}, "$modalStore", modalStore));
  onModalHeightChange(modalElement);
  cPosition = store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]?.position ?? position;
  classesBackdrop = `${cBackdrop} ${regionBackdrop} ${zIndex} ${$$sanitized_props.class ?? ""} ${store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]?.backdropClasses ?? ""}`;
  classesTransitionLayer = `${cTransitionLayer} ${cPosition ?? ""}`;
  classesModal = `${cModal} ${background} ${width} ${height} ${padding} ${spacing} ${rounded} ${shadow} ${store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]?.modalClasses ?? ""}`;
  parent = {
    position,
    // ---
    background,
    width,
    height,
    padding,
    spacing,
    rounded,
    shadow,
    // ---
    buttonNeutral,
    buttonPositive,
    buttonTextCancel,
    buttonTextConfirm,
    buttonTextSubmit,
    // ---
    regionBackdrop,
    regionHeader,
    regionBody,
    regionFooter,
    // ---
    onClose
  };
  if (store_get($$store_subs ??= {}, "$modalStore", modalStore).length > 0) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<!---->`;
    {
      $$payload.out += `<div${attr("class", `modal-backdrop ${stringify(classesBackdrop)} ${stringify(backdropOverflow)}`)} data-testid="modal-backdrop"><div${attr("class", `modal-transition ${stringify(classesTransitionLayer)}`)}>`;
      if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].type !== "component") {
        $$payload.out += "<!--[-->";
        $$payload.out += `<div${attr("class", `modal ${stringify(classesModal)}`)} data-testid="modal" role="dialog" aria-modal="true"${attr("aria-label", store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].title ?? "")}>`;
        if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]?.title) {
          $$payload.out += "<!--[-->";
          $$payload.out += `<header${attr("class", `modal-header ${stringify(regionHeader)}`)}>${html(store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].title)}</header>`;
        } else {
          $$payload.out += "<!--[!-->";
        }
        $$payload.out += `<!--]--> `;
        if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]?.body) {
          $$payload.out += "<!--[-->";
          $$payload.out += `<article${attr("class", `modal-body ${stringify(regionBody)}`)}>${html(store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].body)}</article>`;
        } else {
          $$payload.out += "<!--[!-->";
        }
        $$payload.out += `<!--]--> `;
        if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]?.image && typeof store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]?.image === "string") {
          $$payload.out += "<!--[-->";
          $$payload.out += `<img${attr("class", `modal-image ${stringify(cModalImage)}`)}${attr("src", store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]?.image)} alt="Modal">`;
        } else {
          $$payload.out += "<!--[!-->";
        }
        $$payload.out += `<!--]--> `;
        if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].type === "alert") {
          $$payload.out += "<!--[-->";
          $$payload.out += `<footer${attr("class", `modal-footer ${stringify(regionFooter)}`)}><button type="button"${attr("class", `btn ${stringify(buttonNeutral)}`)}>${escape_html(buttonTextCancel)}</button></footer>`;
        } else {
          $$payload.out += "<!--[!-->";
          if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].type === "confirm") {
            $$payload.out += "<!--[-->";
            $$payload.out += `<footer${attr("class", `modal-footer ${stringify(regionFooter)}`)}><button type="button"${attr("class", `btn ${stringify(buttonNeutral)}`)}>${escape_html(buttonTextCancel)}</button> <button type="button"${attr("class", `btn ${stringify(buttonPositive)}`)}>${escape_html(buttonTextConfirm)}</button></footer>`;
          } else {
            $$payload.out += "<!--[!-->";
            if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].type === "prompt") {
              $$payload.out += "<!--[-->";
              $$payload.out += `<form class="space-y-4"><input${spread_attributes({
                class: "modal-prompt-input input",
                name: "prompt",
                type: "text",
                value: promptValue,
                ...store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].valueAttr
              })}> <footer${attr("class", `modal-footer ${stringify(regionFooter)}`)}><button type="button"${attr("class", `btn ${stringify(buttonNeutral)}`)}>${escape_html(buttonTextCancel)}</button> <button type="submit"${attr("class", `btn ${stringify(buttonPositive)}`)}>${escape_html(buttonTextSubmit)}</button></footer></form>`;
            } else {
              $$payload.out += "<!--[!-->";
            }
            $$payload.out += `<!--]-->`;
          }
          $$payload.out += `<!--]-->`;
        }
        $$payload.out += `<!--]--></div>`;
      } else {
        $$payload.out += "<!--[!-->";
        $$payload.out += `<div${attr("class", `modal contents ${stringify(store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]?.modalClasses ?? "")}`)} data-testid="modal-component" role="dialog" aria-modal="true"${attr("aria-label", store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].title ?? "")}>`;
        if (currentComponent?.slot) {
          $$payload.out += "<!--[-->";
          $$payload.out += `<!---->`;
          currentComponent?.ref?.($$payload, spread_props([
            currentComponent?.props,
            {
              parent,
              children: ($$payload2) => {
                $$payload2.out += `${html(currentComponent?.slot)}`;
              },
              $$slots: { default: true }
            }
          ]));
          $$payload.out += `<!---->`;
        } else {
          $$payload.out += "<!--[!-->";
          $$payload.out += `<!---->`;
          currentComponent?.ref?.($$payload, spread_props([currentComponent?.props, { parent }]));
          $$payload.out += `<!---->`;
        }
        $$payload.out += `<!--]--></div>`;
      }
      $$payload.out += `<!--]--></div></div>`;
    }
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, {
    components,
    position,
    background,
    width,
    height,
    padding,
    spacing,
    rounded,
    shadow,
    zIndex,
    buttonNeutral,
    buttonPositive,
    buttonTextCancel,
    buttonTextConfirm,
    buttonTextSubmit,
    regionBackdrop,
    regionHeader,
    regionBody,
    regionFooter,
    transitions,
    transitionIn,
    transitionInParams,
    transitionOut,
    transitionOutParams
  });
  pop();
}
function Toast($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  push();
  var $$store_subs;
  let classesWrapper, classesSnackbar, classesToast, filteredToasts;
  const toastStore = getToastStore();
  let position = fallback($$props["position"], "b");
  let max = fallback($$props["max"], 3);
  let background = fallback($$props["background"], "variant-filled-secondary");
  let width = fallback($$props["width"], "max-w-[640px]");
  let color = fallback($$props["color"], "");
  let padding = fallback($$props["padding"], "p-4");
  let spacing = fallback($$props["spacing"], "space-x-4");
  let rounded = fallback($$props["rounded"], "rounded-container-token");
  let shadow = fallback($$props["shadow"], "shadow-lg");
  let zIndex = fallback($$props["zIndex"], "z-[888]");
  let buttonAction = fallback($$props["buttonAction"], "btn variant-filled");
  let buttonDismiss = fallback($$props["buttonDismiss"], "btn-icon btn-icon-sm variant-filled");
  let buttonDismissLabel = fallback($$props["buttonDismissLabel"], "✕");
  let transitions = fallback($$props["transitions"], () => !store_get($$store_subs ??= {}, "$prefersReducedMotionStore", prefersReducedMotionStore), true);
  let transitionIn = fallback($$props["transitionIn"], fly);
  let transitionInParams = fallback($$props["transitionInParams"], () => ({ duration: 250 }), true);
  let transitionOut = fallback($$props["transitionOut"], fly);
  let transitionOutParams = fallback($$props["transitionOutParams"], () => ({ duration: 250 }), true);
  const cWrapper = "flex fixed top-0 left-0 right-0 bottom-0 pointer-events-none";
  const cSnackbar = "flex flex-col gap-y-2";
  const cToast = "flex justify-between items-center pointer-events-auto";
  const cToastActions = "flex items-center space-x-2";
  let cPosition;
  let cAlign;
  switch (position) {
    case "t":
      cPosition = "justify-center items-start";
      cAlign = "items-center";
      break;
    case "b":
      cPosition = "justify-center items-end";
      cAlign = "items-center";
      break;
    case "l":
      cPosition = "justify-start items-center";
      cAlign = "items-start";
      break;
    case "r":
      cPosition = "justify-end items-center";
      cAlign = "items-end";
      break;
    case "tl":
      cPosition = "justify-start items-start";
      cAlign = "items-start";
      break;
    case "tr":
      cPosition = "justify-end items-start";
      cAlign = "items-end";
      break;
    case "bl":
      cPosition = "justify-start items-end";
      cAlign = "items-start";
      break;
    case "br":
      cPosition = "justify-end items-end";
      cAlign = "items-end";
      break;
  }
  let wrapperVisible = false;
  classesWrapper = `${cWrapper} ${cPosition} ${zIndex} ${$$sanitized_props.class || ""}`;
  classesSnackbar = `${cSnackbar} ${cAlign} ${padding}`;
  classesToast = `${cToast} ${width} ${color} ${padding} ${spacing} ${rounded} ${shadow}`;
  filteredToasts = Array.from(store_get($$store_subs ??= {}, "$toastStore", toastStore)).slice(0, max);
  if (filteredToasts.length) {
    wrapperVisible = true;
  }
  if (filteredToasts.length > 0 || wrapperVisible) {
    $$payload.out += "<!--[-->";
    const each_array = ensure_array_like(filteredToasts);
    $$payload.out += `<div${attr("class", `snackbar-wrapper ${stringify(classesWrapper)}`)} data-testid="snackbar-wrapper"><div${attr("class", `snackbar ${stringify(classesSnackbar)}`)}><!--[-->`;
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let t = each_array[i];
      $$payload.out += `<div${attr("role", t.hideDismiss ? "alert" : "alertdialog")} aria-live="polite"><div${attr("class", `toast ${stringify(classesToast)} ${stringify(t.background ?? background)} ${stringify(t.classes ?? "")}`)} data-testid="toast"><div class="text-base">${html(t.message)}</div> `;
      if (t.action || !t.hideDismiss) {
        $$payload.out += "<!--[-->";
        $$payload.out += `<div${attr("class", `toast-actions ${stringify(cToastActions)}`)}>`;
        if (t.action) {
          $$payload.out += "<!--[-->";
          $$payload.out += `<button${attr("class", clsx(buttonAction))}>${html(t.action.label)}</button>`;
        } else {
          $$payload.out += "<!--[!-->";
        }
        $$payload.out += `<!--]--> `;
        if (!t.hideDismiss) {
          $$payload.out += "<!--[-->";
          $$payload.out += `<button${attr("class", clsx(buttonDismiss))} aria-label="Dismiss toast">${escape_html(buttonDismissLabel)}</button>`;
        } else {
          $$payload.out += "<!--[!-->";
        }
        $$payload.out += `<!--]--></div>`;
      } else {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]--></div></div>`;
    }
    $$payload.out += `<!--]--></div></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, {
    position,
    max,
    background,
    width,
    color,
    padding,
    spacing,
    rounded,
    shadow,
    zIndex,
    buttonAction,
    buttonDismiss,
    buttonDismissLabel,
    transitions,
    transitionIn,
    transitionInParams,
    transitionOut,
    transitionOutParams
  });
  pop();
}
function WinnerDialog($$payload, $$props) {
  push();
  var $$store_subs;
  const modalStore = getModalStore();
  if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<article class="card w-modal shadow-xl overflow-hidden"><header class="p-4 text-2xl font-semibold"${attr("style", store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].meta.color ? `
          background-color: ${store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].meta.color};
          color: ${getTextColor(store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].meta.color)}
        ` : "")}>${escape_html(store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].title)}</header> <div class="p-4 h1" aria-label="Winner">${escape_html(store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].body)}</div> <footer class="p-4 flex justify-end gap-2 md:gap-4"><button class="btn variant-soft">Close</button> <button class="btn variant-soft-warning">Remove</button></footer></article>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
const toastDefaults = {
  background: "variant-filled",
  timeout: 3e3,
  hideDismiss: true
};
function OpenDialog($$payload, $$props) {
  push();
  var $$store_subs;
  const modalStore = getModalStore();
  getToastStore();
  if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<article class="card w-modal-slim shadow-xl overflow-hidden"><header class="p-4 text-2xl font-semibold flex items-center gap-2"><i class="fas fa-folder-open"></i> <h1>Open a wheel</h1></header> <div class="px-4 flex flex-col gap-4"><button class="btn variant-filled-primary flex flex-col gap-2"><i class="fas fa-cloud text-4xl"></i> <span>Open from the cloud</span></button> <button class="btn variant-filled"><i class="fas fa-hard-drive text-4xl"></i> <span>Open a local file</span></button></div> <footer class="p-4 flex justify-end gap-2 md:gap-4"><button class="btn variant-soft">Cancel</button></footer></article>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function OpenCloudDialog($$payload, $$props) {
  push();
  var $$store_subs;
  const modalStore = getModalStore();
  getToastStore();
  let innerHeight = 0;
  let apiWheels = [];
  let selectedWheel = "";
  let filter = "";
  let sort = "updated-desc";
  let page = 0;
  const wheelImages = {};
  let wheelsPerPage = Math.floor(innerHeight / 200);
  let sortedWheels = apiWheels.toSorted((a, b) => {
    switch (sort) {
      case "updated-desc":
        return (b.updated || b.created) - (a.updated || a.created);
      case "updated-asc":
        return (a.updated || a.created) - (b.updated || b.created);
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });
  let filteredWheels = sortedWheels.filter((wheel) => wheel.title.toLowerCase().includes(filter.toLowerCase()));
  let pageWheels = filteredWheels.slice(page * wheelsPerPage, page * wheelsPerPage + wheelsPerPage);
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]) {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<article class="card w-modal p-4 shadow-xl overflow-hidden flex flex-col gap-4"><header class="text-2xl font-semibold flex items-center gap-2"><i class="fas fa-floppy-disk"></i> <h1>Open a wheel</h1></header> <form class="flex flex-col gap-2">`;
      if (apiWheels.length) {
        $$payload2.out += "<!--[-->";
        if (apiWheels.length > wheelsPerPage) {
          $$payload2.out += "<!--[-->";
          $$payload2.out += `<label class="input-group grid-cols-[auto_1fr]"><div><i class="fas fa-search"></i></div> <input type="search" class="input" placeholder="Search..."${attr("value", filter)} aria-label="Search"></label> <select class="select" aria-label="Sort" title="Sort"><option value="updated-desc">Save date (newest first)</option><option value="updated-asc">Save date (oldest first)</option><option value="title-asc">Alphabetical (ascending)</option><option value="title-desc">Alphabetical (descending)</option></select>`;
        } else {
          $$payload2.out += "<!--[!-->";
        }
        $$payload2.out += `<!--]--> `;
        RadioGroup($$payload2, {
          rounded: "rounded-container-token",
          flexDirection: "flex-col",
          padding: "p-1",
          children: ($$payload3) => {
            const each_array = ensure_array_like(pageWheels);
            $$payload3.out += `<!--[-->`;
            for (let i = 0, $$length = each_array.length; i < $$length; i++) {
              let wheel = each_array[i];
              if (i !== 0) {
                $$payload3.out += "<!--[-->";
                $$payload3.out += `<hr>`;
              } else {
                $$payload3.out += "<!--[!-->";
              }
              $$payload3.out += `<!--]--> `;
              RadioItem($$payload3, {
                name: "wheel",
                value: wheel.path,
                get group() {
                  return selectedWheel;
                },
                set group($$value) {
                  selectedWheel = $$value;
                  $$settled = false;
                },
                children: ($$payload4) => {
                  $$payload4.out += `<div class="flex items-center gap-2">`;
                  Avatar($$payload4, {
                    src: wheelImages[wheel.path],
                    width: "w-14",
                    initials: "?"
                  });
                  $$payload4.out += `<!----> <div class="min-h-14 flex-1 flex flex-col justify-center"><div class="flex gap-2 justify-center items-center"><span class="text-lg font-semibold">${escape_html(wheel.title)}</span> `;
                  if (wheel.visibility === "private") {
                    $$payload4.out += "<!--[-->";
                    $$payload4.out += `<i class="fas fa-lock text-xs" title="Private"></i>`;
                  } else {
                    $$payload4.out += "<!--[!-->";
                  }
                  $$payload4.out += `<!--]--></div> `;
                  if (wheel.visibility === "public") {
                    $$payload4.out += "<!--[-->";
                    $$payload4.out += `<div class="text-sm mt-1 flex gap-2 justify-center items-center"><i class="fas fa-globe" title="Public"></i> <span>${escape_html(wheel.path)}</span></div>`;
                  } else {
                    $$payload4.out += "<!--[!-->";
                  }
                  $$payload4.out += `<!--]--></div> <div><button type="button" class="btn-icon btn-icon-sm" aria-label="Settings"><i class="fas fa-ellipsis-v"></i></button> <div class="card p-2 rounded-xl"${attr("data-popup", `popup(${stringify(wheel.path)})`)}><div class="flex flex-col gap-2"><button type="button" class="btn btn-sm variant-filled-error flex items-center gap-2"><i class="fas fa-trash"></i> Delete wheel</button> <button type="button" class="btn btn-sm variant-filled-warning flex items-center gap-2">`;
                  if (wheel.visibility === "private") {
                    $$payload4.out += "<!--[-->";
                    $$payload4.out += `<i class="fas fa-lock-open"></i> Make public`;
                  } else {
                    $$payload4.out += "<!--[!-->";
                    $$payload4.out += `<i class="fas fa-lock"></i> Make private`;
                  }
                  $$payload4.out += `<!--]--></button></div></div></div></div>`;
                },
                $$slots: { default: true }
              });
              $$payload3.out += `<!---->`;
            }
            $$payload3.out += `<!--]--> `;
            if (!pageWheels.length) {
              $$payload3.out += "<!--[-->";
              $$payload3.out += `<div class="flex justify-center items-center min-h-14">No wheels found</div>`;
            } else {
              $$payload3.out += "<!--[!-->";
              if (filteredWheels.length > wheelsPerPage) {
                $$payload3.out += "<!--[-->";
                $$payload3.out += `<div${attr("style", `height: ${stringify(4 * (wheelsPerPage - pageWheels.length))}rem`)}></div>`;
              } else {
                $$payload3.out += "<!--[!-->";
              }
              $$payload3.out += `<!--]-->`;
            }
            $$payload3.out += `<!--]-->`;
          },
          $$slots: { default: true }
        });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `<p class="text-center">No wheels found</p>`;
        }
        $$payload2.out += `<!--]-->`;
      }
      $$payload2.out += `<!--]--> `;
      if (apiWheels.length > wheelsPerPage) {
        $$payload2.out += "<!--[-->";
        $$payload2.out += `<div class="flex justify-evenly items-center"><button type="button" class="btn variant-soft"${attr("disabled", page === 0, true)} aria-label="Previous page" title="Previous page"><i class="fas fa-chevron-left"></i></button> <span class="text-center">${escape_html(page + 1)} / ${escape_html(Math.ceil(filteredWheels.length / wheelsPerPage) || 1)}</span> <button type="button" class="btn variant-soft"${attr("disabled", page >= Math.ceil(filteredWheels.length / wheelsPerPage) - 1, true)} aria-label="Next page" title="Next page"><i class="fas fa-chevron-right"></i></button></div>`;
      } else {
        $$payload2.out += "<!--[!-->";
      }
      $$payload2.out += `<!--]--> <footer class="flex justify-end gap-2"><button type="button" class="btn variant-soft">Cancel</button> <button class="btn variant-filled-primary"${attr("disabled", !selectedWheel, true)}>`;
      {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `Open`;
      }
      $$payload2.out += `<!--]--></button></footer></form></article>`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function SaveDialog($$payload, $$props) {
  push();
  var $$store_subs;
  const modalStore = getModalStore();
  if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<article class="card w-modal-slim shadow-xl overflow-hidden"><header class="p-4 text-2xl font-semibold flex items-center gap-2"><i class="fas fa-floppy-disk"></i> <h1>Save a wheel</h1></header> <div class="px-4 flex flex-col gap-4"><button class="btn variant-filled-primary flex flex-col gap-2"><i class="fas fa-cloud text-4xl"></i> <span>Save to the cloud</span></button> <button class="btn variant-filled"><i class="fas fa-hard-drive text-4xl"></i> <span>Save to a local file</span></button></div> <footer class="p-4 flex justify-end gap-2 md:gap-4"><button class="btn variant-soft">Cancel</button></footer></article>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function SaveCloudDialog($$payload, $$props) {
  push();
  var $$store_subs;
  const modalStore = getModalStore();
  getToastStore();
  let title = wheelStore.config.title;
  let loading = false;
  let saveMode = "new";
  if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<article class="card w-modal-slim p-4 shadow-xl overflow-hidden flex flex-col gap-4"><header class="text-2xl font-semibold flex items-center gap-2"><i class="fas fa-floppy-disk"></i> <h1>Save a wheel</h1></header> <form class="flex flex-col gap-4">`;
    if (wheelStore.path) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<div class="flex flex-col gap-2"><label class="flex items-center gap-2"><input type="radio" name="saveMode" value="overwrite"${attr("checked", saveMode === "overwrite", true)} class="radio"> <span>Overwrite "${escape_html(wheelStore.config.title)}" (${escape_html(wheelStore.path)})</span></label> <label class="flex items-center gap-2"><input type="radio" name="saveMode" value="new"${attr("checked", saveMode === "new", true)} checked class="radio"> <span>Save a new wheel</span></label></div>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--> <label class="label"><span class="required">Title</span> <input type="text" maxlength="50" required${attr("value", title)} placeholder="Enter a title for your wheel" class="input"></label> <footer class="flex justify-end gap-2"><button type="button" class="btn variant-soft">Cancel</button> <button class="btn variant-filled-primary"${attr("aria-busy", loading)}>`;
    {
      $$payload.out += "<!--[!-->";
      $$payload.out += `Save`;
    }
    $$payload.out += `<!--]--></button></footer></form></article>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function SaveLocalDialog($$payload, $$props) {
  push();
  var $$store_subs;
  const modalStore = getModalStore();
  getToastStore();
  let fileName = wheelStore.config.title;
  if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<article class="card w-modal-slim shadow-xl overflow-hidden"><header class="p-4 text-2xl font-semibold flex items-center gap-2"><i class="fas fa-floppy-disk"></i> <h1>Save a wheel</h1></header> <form class="px-4 flex flex-col gap-4"><label class="label"><span>File name</span> <div class="input-group grid-cols-[1fr_auto]"><input type="text" maxlength="50"${attr("value", fileName)} placeholder="Untitled"> <div>.wheel</div></div></label></form> <footer class="p-4 flex justify-end gap-2 md:gap-4"><button class="btn variant-soft">Cancel</button> <button class="btn variant-filled-primary">Save</button></footer></article>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function AccountDialog($$payload, $$props) {
  push();
  var $$store_subs;
  const modalStore = getModalStore();
  getToastStore();
  const authUser = getCurrentUser();
  if (!authUser) {
    modalStore.close();
    modalStore.trigger({ type: "component", component: "loginDialog" });
  }
  if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<article class="card p-4 w-modal shadow-lg overflow-hidden flex flex-col gap-4"><header class="h3 flex items-center gap-2"><i class="fas fa-user"></i> <h1>Account</h1></header> `;
    if (!authUser?.emailVerified) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<aside class="alert variant-soft-warning"><i class="fas fa-exclamation-triangle"></i> <p class="alert-message">Your email address is not verified.</p> <button class="btn btn-sm variant-filled">Send verification email</button></aside>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--> <section class="flex flex-col gap-2">`;
    if (authUser?.displayName) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<div>${escape_html(authUser?.displayName)}</div>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--> `;
    if (authUser?.email) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<div>Email: <pre>${escape_html(authUser?.email)}</pre></div>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--> <div>User ID: <pre>${escape_html(authUser?.uid)}</pre></div> <div><button class="btn variant-soft-warning">Log out</button></div></section> <footer class="flex justify-end gap-2"><button class="btn variant-filled">Close</button></footer></article>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function EmailPasswordForm($$payload, $$props) {
  push();
  let { onSubmit, formError, body, footerButtons } = $$props;
  let loading = false;
  let errors = {};
  if (formError) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="alert variant-soft-error">${escape_html(formError)}</div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <form class="flex flex-col gap-4"><label class="label"><span class="required">Email</span> <input type="email" name="email" minlength="6" maxlength="64" required class="input"> `;
  if (errors.email) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<span class="text-sm text-error-400-500-token">${escape_html(errors.email[0])}</span>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></label> <label class="label"><span class="required">Password</span> <div class="input-group grid-cols-[1fr_auto]"><input${attr("type", "password")} name="password" minlength="8" maxlength="64" required> <button type="button" class="btn variant-soft rounded-none"${attr("title", "Show password")}${attr("aria-label", "Show password")}><i${attr("class", `fas ${stringify("fa-eye")} w-6`)}></i></button></div> `;
  if (errors.password) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<span class="text-sm text-error-400-500-token">${escape_html(errors.password[0])}</span>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></label> `;
  body($$payload);
  $$payload.out += `<!----> <footer class="flex justify-end gap-2">`;
  footerButtons($$payload);
  $$payload.out += `<!----> <button class="btn variant-filled-primary"${attr("aria-busy", loading)}>`;
  {
    $$payload.out += "<!--[!-->";
    $$payload.out += `Submit`;
  }
  $$payload.out += `<!--]--></button></footer></form>`;
  pop();
}
function LoginDialog($$payload, $$props) {
  push();
  var $$store_subs;
  const modalStore = getModalStore();
  const toastStore = getToastStore();
  let formError = null;
  const onSubmit = async (user) => {
    await signIn(user.email, user.password);
    if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].meta?.next) {
      modalStore.trigger({
        type: "component",
        component: store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].meta.next
      });
    }
    modalStore.close();
    toastStore.trigger({
      ...toastDefaults,
      message: "Logged in",
      background: "variant-filled-primary",
      timeout: 2e3
    });
  };
  if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<article class="card p-4 w-modal shadow-lg overflow-hidden flex flex-col gap-4"><header class="h3 flex items-center gap-2"><i class="fas fa-user"></i> <h1>Log in</h1></header> `;
    {
      let body = function($$payload2) {
        $$payload2.out += `<div class="flex flex-wrap justify-between gap-2"><button type="button" class="btn btn-sm variant-soft">Forgot password</button> <button type="button" class="btn btn-sm variant-soft">Don't have an account? Sign up</button></div>`;
      }, footerButtons = function($$payload2) {
        $$payload2.out += `<button type="button" class="btn variant-soft">Close</button>`;
      };
      EmailPasswordForm($$payload, {
        onSubmit,
        formError,
        body,
        footerButtons,
        $$slots: { body: true, footerButtons: true }
      });
    }
    $$payload.out += `<!----></article>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function SignUpDialog($$payload, $$props) {
  push();
  var $$store_subs;
  const modalStore = getModalStore();
  const toastStore = getToastStore();
  let formError = null;
  const onSubmit = async (user) => {
    await registerUser(user.email, user.password);
    await signIn(user.email, user.password);
    if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].meta?.next) {
      modalStore.trigger({
        type: "component",
        component: store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].meta.next
      });
    }
    modalStore.close();
    toastStore.trigger({
      ...toastDefaults,
      message: "Account created",
      background: "variant-filled-primary"
    });
  };
  if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<article class="card p-4 w-modal shadow-lg overflow-hidden flex flex-col gap-4"><header class="h3 flex items-center gap-2"><i class="fas fa-user"></i> <h1>Sign up</h1></header> `;
    {
      let body = function($$payload2) {
        $$payload2.out += `<div><button type="button" class="btn btn-sm variant-soft">Already have an account? Log in</button></div>`;
      }, footerButtons = function($$payload2) {
        $$payload2.out += `<button type="button" class="btn variant-soft">Close</button>`;
      };
      EmailPasswordForm($$payload, {
        onSubmit,
        formError,
        body,
        footerButtons,
        $$slots: { body: true, footerButtons: true }
      });
    }
    $$payload.out += `<!----></article>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function ResetPasswordDialog($$payload, $$props) {
  push();
  var $$store_subs;
  const modalStore = getModalStore();
  getToastStore();
  let email = "";
  let loading = false;
  let errors = {};
  if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<article class="card p-4 w-modal shadow-lg overflow-hidden flex flex-col gap-4"><header class="h3 flex items-center gap-2"><i class="fas fa-key"></i> <h1>Reset password</h1></header> <form class="flex flex-col gap-4"><label class="label"><span class="required">Email</span> <input type="email" name="email" minlength="6" maxlength="64" required${attr("value", email)} class="input"> `;
    if (errors.email) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<span class="text-sm text-error-400-500-token">${escape_html(errors.email[0])}</span>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--></label> <footer class="flex justify-end gap-2"><button type="button" class="btn btn-sm variant-soft">Close</button> <button class="btn variant-filled-primary"${attr("aria-busy", loading)}>`;
    {
      $$payload.out += "<!--[!-->";
      $$payload.out += `Send password reset email`;
    }
    $$payload.out += `<!--]--></button></footer></form></article>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function CustomizeDialogBasic($$payload, $$props) {
  push();
  let {
    title = void 0,
    description = void 0,
    spinTime = void 0
  } = $$props;
  const secondsFormat = {
    style: "unit",
    unit: "second",
    unitDisplay: "long"
  };
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<div class="flex flex-col gap-2"><label class="label"><span>Title</span> <input type="text" class="input" maxlength="50"${attr("value", title)}></label> <label class="label"><span>Description</span> <textarea class="textarea resize-none" maxlength="200">`;
    const $$body = escape_html(description);
    if ($$body) {
      $$payload2.out += `${$$body}`;
    }
    $$payload2.out += `</textarea></label> `;
    RangeSlider($$payload2, {
      name: "spinTime",
      label: "Spin time",
      min: 1,
      max: 60,
      ticked: true,
      get value() {
        return spinTime;
      },
      set value($$value) {
        spinTime = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        $$payload3.out += `<div class="flex justify-between items-center"><span>Spin time</span> <span class="text-sm">${escape_html(spinTime.toLocaleString("en", secondsFormat))}</span></div>`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!----></div>`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { title, description, spinTime });
  pop();
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var FEATURE_FLAG_NAMES = Object.freeze({
  // This flag exists as a workaround for issue 454 (basically a browser bug) - seems like these rect values take time to update when in grid layout. Setting it to true can cause strange behaviour in the REPL for non-grid zones, see issue 470
  USE_COMPUTED_STYLE_INSTEAD_OF_BOUNDING_RECT: "USE_COMPUTED_STYLE_INSTEAD_OF_BOUNDING_RECT"
});
_defineProperty({}, FEATURE_FLAG_NAMES.USE_COMPUTED_STYLE_INSTEAD_OF_BOUNDING_RECT, false);
var _ID_TO_INSTRUCTION;
var INSTRUCTION_IDs$1 = {
  DND_ZONE_ACTIVE: "dnd-zone-active",
  DND_ZONE_DRAG_DISABLED: "dnd-zone-drag-disabled"
};
_ID_TO_INSTRUCTION = {}, _defineProperty(_ID_TO_INSTRUCTION, INSTRUCTION_IDs$1.DND_ZONE_ACTIVE, "Tab to one the items and press space-bar or enter to start dragging it"), _defineProperty(_ID_TO_INSTRUCTION, INSTRUCTION_IDs$1.DND_ZONE_DRAG_DISABLED, "This is a disabled drag and drop list"), _ID_TO_INSTRUCTION;
function ColorsControl($$payload, $$props) {
  push();
  let { colors = [] } = $$props;
  let colorsArray = colors.map((hex, i) => ({ name: hex, id: i }));
  const each_array = ensure_array_like(colorsArray);
  $$payload.out += `<div class="flex items-center gap-2"><div class="p-2 flex flex-wrap gap-2 w-fit rounded-3xl variant-soft"><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let item = each_array[$$index];
    $$payload.out += `<div class="flex flex-col" aria-label="Use enter and the arrow keys to reorder this color"><div class="h-6 flex justify-center items-center bg-surface-50-900-token rounded-t-full" title="Drag to reorder"><i class="fas fa-grip text-surface-300-600-token"></i></div> <input type="color"${attr("value", item.name)} class="w-8 h-8 cursor-pointer"${attr("style", `background-color: ${stringify(item.name)}`)} title="Edit color" aria-label="Edit color"> <button class="h-6 bg-surface-50-900-token rounded-b-full" title="Delete color" aria-label="Delete color"><i class="fas fa-times text-surface-400-500-token"></i></button></div>`;
  }
  $$payload.out += `<!--]--></div> <button class="btn btn-icon-sm variant-filled" title="Add color" aria-label="Add color"><i class="fas fa-plus"></i></button></div>`;
  bind_props($$props, { colors });
  pop();
}
function CustomizeDialogAppearance($$payload, $$props) {
  push();
  let {
    type = void 0,
    image = void 0,
    colors = void 0,
    hubSize = void 0
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<div><span>Wheel background</span> <div>`;
    RadioGroup($$payload2, {
      children: ($$payload3) => {
        RadioItem($$payload3, {
          name: "color",
          value: "color",
          get group() {
            return type;
          },
          set group($$value) {
            type = $$value;
            $$settled = false;
          },
          children: ($$payload4) => {
            $$payload4.out += `<!---->Color`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----> `;
        RadioItem($$payload3, {
          name: "image",
          value: "image",
          get group() {
            return type;
          },
          set group($$value) {
            type = $$value;
            $$settled = false;
          },
          children: ($$payload4) => {
            $$payload4.out += `<!---->Image`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!----></div></div> <div class="label"><span>Colors</span> `;
    ColorsControl($$payload2, {
      get colors() {
        return colors;
      },
      set colors($$value) {
        colors = $$value;
        $$settled = false;
      }
    });
    $$payload2.out += `<!----></div> <label class="label"><span>${escape_html(type === "color" ? "Center image" : "Background image")}</span> <div class="flex flex-wrap gap-2"><div><input type="file" class="input" accept="image/*"></div> `;
    if (image) {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<div class="flex gap-2">`;
      Avatar($$payload2, {
        rounded: "rounded-full",
        src: image,
        width: "w-20"
      });
      $$payload2.out += `<!----> <button class="btn btn-icon variant-soft" title="Remove image" aria-label="Remove image"><i class="fas fa-times"></i></button></div>`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]--></div></label> `;
    if (type === "color") {
      $$payload2.out += "<!--[-->";
      const each_array = ensure_array_like(Object.keys(hubSizes));
      $$payload2.out += `<label class="label"><span>Hub size</span> <select class="select"><!--[-->`;
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let item = each_array[$$index];
        $$payload2.out += `<option${attr("value", item)}>${escape_html(item)}</option>`;
      }
      $$payload2.out += `<!--]--></select></label>`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { type, image, colors, hubSize });
  pop();
}
function CustomizeDialogDuringSpin($$payload, $$props) {
  let {
    duringSpinSound = void 0,
    indefiniteSpin = void 0
  } = $$props;
  const each_array = ensure_array_like(duringSpinSounds);
  $$payload.out += `<label class="label"><span>Sound</span> <select class="select"><option value="">No sound</option><option value="tick">Tick</option><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let item = each_array[$$index];
    $$payload.out += `<option${attr("value", item.file)}>${escape_html(item.name)}</option>`;
  }
  $$payload.out += `<!--]--></select></label> <label class="flex items-center space-x-2 w-fit"><input type="checkbox"${attr("checked", indefiniteSpin, true)} class="checkbox"> <span>Keep spinning until the wheel is clicked</span></label>`;
  bind_props($$props, { duringSpinSound, indefiniteSpin });
}
function CustomizeDialogAfterSpin($$payload, $$props) {
  let {
    afterSpinSound = void 0,
    displayWinnerDialog = void 0,
    winnerMessage = void 0,
    confetti = void 0
  } = $$props;
  const each_array = ensure_array_like(afterSpinSounds);
  const each_array_1 = ensure_array_like(confettiTypes);
  $$payload.out += `<label class="label"><span>Sound</span> <select class="select"><option value="">No sound</option><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let item = each_array[$$index];
    $$payload.out += `<option${attr("value", item.file)}>${escape_html(item.name)}</option>`;
  }
  $$payload.out += `<!--]--></select></label> <label class="flex items-center space-x-2 w-fit"><input type="checkbox"${attr("checked", displayWinnerDialog, true)} class="checkbox"> <span>Display winner dialog</span></label> <label class="label"><span>Winner message</span> <input type="text" class="input" maxlength="50"${attr("value", winnerMessage)} placeholder="We have a winner!"${attr("disabled", !displayWinnerDialog, true)}></label> <label class="label"><span>Confetti</span> <select class="select"><!--[-->`;
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let item = each_array_1[$$index_1];
    $$payload.out += `<option${attr("value", item)}>${escape_html(item)}</option>`;
  }
  $$payload.out += `<!--]--></select></label>`;
  bind_props($$props, {
    afterSpinSound,
    displayWinnerDialog,
    winnerMessage,
    confetti
  });
}
function CustomizeDialog($$payload, $$props) {
  push();
  var $$store_subs;
  const modalStore = getModalStore();
  const config = snapshot(wheelStore.config);
  let openTab = "basic";
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]) {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<article class="p-4 card w-modal flex flex-col gap-4 shadow-xl"><header class="text-2xl font-semibold flex items-center gap-2"><i class="fas fa-palette"></i> <h1>Customize</h1></header> `;
      {
        let panel = function($$payload3) {
          if (openTab === "basic") {
            $$payload3.out += "<!--[-->";
            CustomizeDialogBasic($$payload3, {
              get title() {
                return config.title;
              },
              set title($$value) {
                config.title = $$value;
                $$settled = false;
              },
              get description() {
                return config.description;
              },
              set description($$value) {
                config.description = $$value;
                $$settled = false;
              },
              get spinTime() {
                return config.spinTime;
              },
              set spinTime($$value) {
                config.spinTime = $$value;
                $$settled = false;
              }
            });
          } else {
            $$payload3.out += "<!--[!-->";
            if (openTab === "appearance") {
              $$payload3.out += "<!--[-->";
              CustomizeDialogAppearance($$payload3, {
                get type() {
                  return config.type;
                },
                set type($$value) {
                  config.type = $$value;
                  $$settled = false;
                },
                get colors() {
                  return config.colors;
                },
                set colors($$value) {
                  config.colors = $$value;
                  $$settled = false;
                },
                get image() {
                  return config.image;
                },
                set image($$value) {
                  config.image = $$value;
                  $$settled = false;
                },
                get hubSize() {
                  return config.hubSize;
                },
                set hubSize($$value) {
                  config.hubSize = $$value;
                  $$settled = false;
                }
              });
            } else {
              $$payload3.out += "<!--[!-->";
              if (openTab === "duringSpin") {
                $$payload3.out += "<!--[-->";
                CustomizeDialogDuringSpin($$payload3, {
                  get duringSpinSound() {
                    return config.duringSpinSound;
                  },
                  set duringSpinSound($$value) {
                    config.duringSpinSound = $$value;
                    $$settled = false;
                  },
                  get indefiniteSpin() {
                    return config.indefiniteSpin;
                  },
                  set indefiniteSpin($$value) {
                    config.indefiniteSpin = $$value;
                    $$settled = false;
                  }
                });
              } else {
                $$payload3.out += "<!--[!-->";
                if (openTab === "afterSpin") {
                  $$payload3.out += "<!--[-->";
                  CustomizeDialogAfterSpin($$payload3, {
                    get afterSpinSound() {
                      return config.afterSpinSound;
                    },
                    set afterSpinSound($$value) {
                      config.afterSpinSound = $$value;
                      $$settled = false;
                    },
                    get displayWinnerDialog() {
                      return config.displayWinnerDialog;
                    },
                    set displayWinnerDialog($$value) {
                      config.displayWinnerDialog = $$value;
                      $$settled = false;
                    },
                    get winnerMessage() {
                      return config.winnerMessage;
                    },
                    set winnerMessage($$value) {
                      config.winnerMessage = $$value;
                      $$settled = false;
                    },
                    get confetti() {
                      return config.confetti;
                    },
                    set confetti($$value) {
                      config.confetti = $$value;
                      $$settled = false;
                    }
                  });
                } else {
                  $$payload3.out += "<!--[!-->";
                }
                $$payload3.out += `<!--]-->`;
              }
              $$payload3.out += `<!--]-->`;
            }
            $$payload3.out += `<!--]-->`;
          }
          $$payload3.out += `<!--]-->`;
        };
        TabGroup($$payload2, {
          class: "flex-1 flex flex-col",
          regionPanel: "flex-1 flex flex-col gap-4 min-h-48",
          panel,
          children: ($$payload3) => {
            Tab($$payload3, {
              name: "basic",
              value: "basic",
              get group() {
                return openTab;
              },
              set group($$value) {
                openTab = $$value;
                $$settled = false;
              },
              children: ($$payload4) => {
                $$payload4.out += `<!---->Basic`;
              },
              $$slots: { default: true }
            });
            $$payload3.out += `<!----> `;
            Tab($$payload3, {
              name: "appearance",
              value: "appearance",
              get group() {
                return openTab;
              },
              set group($$value) {
                openTab = $$value;
                $$settled = false;
              },
              children: ($$payload4) => {
                $$payload4.out += `<!---->Appearance`;
              },
              $$slots: { default: true }
            });
            $$payload3.out += `<!----> `;
            Tab($$payload3, {
              name: "duringSpin",
              value: "duringSpin",
              get group() {
                return openTab;
              },
              set group($$value) {
                openTab = $$value;
                $$settled = false;
              },
              children: ($$payload4) => {
                $$payload4.out += `<!---->During spin`;
              },
              $$slots: { default: true }
            });
            $$payload3.out += `<!----> `;
            Tab($$payload3, {
              name: "afterSpin",
              value: "afterSpin",
              get group() {
                return openTab;
              },
              set group($$value) {
                openTab = $$value;
                $$settled = false;
              },
              children: ($$payload4) => {
                $$payload4.out += `<!---->After spin`;
              },
              $$slots: { default: true }
            });
            $$payload3.out += `<!---->`;
          },
          $$slots: { panel: true, default: true }
        });
      }
      $$payload2.out += `<!----> <footer class="flex justify-end gap-2"><button class="btn variant-soft">Cancel</button> <button class="btn variant-filled-primary">Save</button></footer></article>`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function ShareDialog($$payload, $$props) {
  push();
  var $$store_subs;
  const modalStore = getModalStore();
  getToastStore();
  let title = wheelStore.config.title;
  let loading = false;
  let shareMode = "new";
  if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<article class="card p-4 w-modal shadow-lg overflow-hidden flex flex-col gap-4"><header class="h3 flex items-center gap-2"><i class="fas fa-share-nodes"></i> <h1>Share wheel</h1></header> <section class="flex flex-col gap-2"><p>Sharing a wheel will make it public for anyone to see and spin if they
        have the link.</p> <p>Others will not be able to edit the wheel, nor will they be able to see
        changes you make after sharing.</p> <p>Each person who opens the wheel will be able to spin it as many times as
        they want, and their results will be independent of anyone else's.</p></section> <form class="flex flex-col gap-4">`;
    if (wheelStore.path) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<div class="flex flex-col gap-2"><label class="flex items-center gap-2"><input type="radio" name="saveMode" value="overwrite"${attr("checked", shareMode === "overwrite", true)} class="radio"> <span>Overwrite "${escape_html(wheelStore.config.title)}" (${escape_html(wheelStore.path)})</span></label> <label class="flex items-center gap-2"><input type="radio" name="saveMode" value="new"${attr("checked", shareMode === "new", true)} checked class="radio"> <span>Share as a new wheel</span></label></div>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--> <label class="label"><span class="required">Title</span> <input type="text" name="title" required maxlength="50"${attr("value", title)} placeholder="Enter a title for your wheel" class="input"></label> <footer class="flex justify-end gap-2"><button type="button" class="btn variant-soft">Cancel</button> <button class="btn variant-filled-primary"${attr("aria-busy", loading)}>`;
    {
      $$payload.out += "<!--[!-->";
      $$payload.out += `Share`;
    }
    $$payload.out += `<!--]--></button></footer></form></article>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function SharedLinkDialog($$payload, $$props) {
  push();
  var $$store_subs;
  const modalStore = getModalStore();
  const path = store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].meta.path;
  const link = `${window.location.origin}/${path}`;
  if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<article class="card p-4 w-modal-slim shadow-lg overflow-hidden flex flex-col gap-4"><header class="h3 flex items-center gap-2"><i class="fas fa-share-nodes"></i> <h1>Wheel shared</h1></header> <section class="flex flex-col gap-2"><p>Your wheel has been shared. It can be viewed and spun by anyone using the
      link below.</p> <div class="flex justify-between items-center bg-surface-50-900-token rounded-xl px-4 py-3"><a${attr("href", `/${stringify(path)}`)}>${escape_html(link)}</a> <button class="btn-icon variant-filled-primary" aria-label="Copy link to clipboard" title="Copy link to clipboard"><i class="fas fa-clipboard"></i></button></div></section> <footer class="flex justify-end gap-2"><button type="button" class="btn variant-soft">Close</button></footer></article>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function DeleteWheelDialog($$payload, $$props) {
  push();
  var $$store_subs;
  const modalStore = getModalStore();
  getToastStore();
  const path = store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].meta.path;
  const title = store_get($$store_subs ??= {}, "$modalStore", modalStore)[0].meta.title;
  if (store_get($$store_subs ??= {}, "$modalStore", modalStore)[0]) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<article class="card w-modal-slim p-4 shadow-xl overflow-hidden flex flex-col gap-4"><header class="text-2xl font-semibold flex items-center gap-2"><i class="fas fa-trash"></i> <h1>Delete wheel</h1></header> <section class="flex flex-col gap-2"><p>Are you sure you want to delete this wheel?</p> <div class="p-2 rounded flex gap-2 items-center bg-surface-50-900-token"><span class="text-xl">"${escape_html(title)}"</span> <span class="text-sm">(${escape_html(path)})</span></div> <p class="text-sm font-semibold text-error-700-200-token">This action cannot be undone.</p></section> <footer class="flex justify-end gap-2"><button class="btn variant-filled">Cancel</button> <button class="btn variant-filled-error">`;
    {
      $$payload.out += "<!--[!-->";
      $$payload.out += `Delete`;
    }
    $$payload.out += `<!--]--></button></footer></article>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function _layout($$payload, $$props) {
  push();
  let { children } = $$props;
  storePopup.set({
    computePosition,
    autoUpdate,
    flip,
    shift,
    offset,
    arrow
  });
  initializeStores();
  const modalStore = getModalStore();
  const modalRegistry = {
    winnerDialog: { ref: WinnerDialog },
    openDialog: { ref: OpenDialog },
    openCloudDialog: { ref: OpenCloudDialog },
    saveDialog: { ref: SaveDialog },
    saveCloudDialog: { ref: SaveCloudDialog },
    saveLocalDialog: { ref: SaveLocalDialog },
    accountDialog: { ref: AccountDialog },
    loginDialog: { ref: LoginDialog },
    signUpDialog: { ref: SignUpDialog },
    resetPasswordDialog: { ref: ResetPasswordDialog },
    customizeDialog: { ref: CustomizeDialog },
    shareDialog: { ref: ShareDialog },
    sharedLinkDialog: { ref: SharedLinkDialog },
    deleteWheelDialog: { ref: DeleteWheelDialog }
  };
  onNavigate(modalStore.close);
  let webManifestLink = pwaInfo?.webManifest.linkTag;
  head($$payload, ($$payload2) => {
    $$payload2.out += `${html(webManifestLink)} `;
    if (process.env.NODE_ENV !== "development") {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<script async${attr("src", `https://www.googletagmanager.com/gtag/js?id=${stringify(PUBLIC_FIREBASE_MEASUREMENT_ID)}`)}><\/script> ${html(`
      <script>
        window.dataLayer = window.dataLayer || []
        function gtag() {
          dataLayer.push(arguments)
        }
        gtag('js', new Date())
        gtag('config', '${PUBLIC_FIREBASE_MEASUREMENT_ID}')
      <\/script>
    `)}`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  });
  Toast($$payload, {});
  $$payload.out += `<!----> `;
  Modal($$payload, { components: modalRegistry });
  $$payload.out += `<!----> `;
  children?.($$payload);
  $$payload.out += `<!----> <!---->`;
  await_block(
    import("./ReloadPrompt.js"),
    () => {
    },
    ({ default: ReloadPrompt }) => {
      $$payload.out += `<!---->`;
      ReloadPrompt($$payload, {});
      $$payload.out += `<!---->`;
    }
  );
  $$payload.out += `<!---->`;
  pop();
}
export {
  _layout as _,
  getToastStore as g
};
