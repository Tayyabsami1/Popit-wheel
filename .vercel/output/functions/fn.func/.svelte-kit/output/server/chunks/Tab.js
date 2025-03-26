import { a4 as sanitize_slots, Q as push, Y as fallback, R as setContext, $ as attr, _ as stringify, a1 as slot, a2 as bind_props, S as pop, a3 as sanitize_props, X as rest_props, W as getContext, a9 as clsx, Z as spread_attributes } from "./index.js";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function TabGroup($$payload, $$props) {
  const $$slots = sanitize_slots($$props);
  const $$sanitized_props = sanitize_props($$props);
  push();
  let classesBase, classesList, classesPanel;
  let justify = fallback($$props["justify"], "justify-start");
  let border = fallback($$props["border"], "border-b border-surface-400-500-token");
  let active = fallback($$props["active"], "border-b-2 border-surface-900-50-token");
  let hover = fallback($$props["hover"], "hover:variant-soft");
  let flex = fallback($$props["flex"], "flex-none");
  let padding = fallback($$props["padding"], "px-4 py-2");
  let rounded = fallback($$props["rounded"], "rounded-tl-container-token rounded-tr-container-token");
  let spacing = fallback($$props["spacing"], "space-y-1");
  let regionList = fallback($$props["regionList"], "");
  let regionPanel = fallback($$props["regionPanel"], "");
  let labelledby = fallback($$props["labelledby"], "");
  let panel = fallback($$props["panel"], "");
  setContext("active", active);
  setContext("hover", hover);
  setContext("flex", flex);
  setContext("padding", padding);
  setContext("rounded", rounded);
  setContext("spacing", spacing);
  const cBase = "space-y-4";
  const cList = "flex overflow-x-auto hide-scrollbar";
  const cPanel = "";
  classesBase = `${cBase} ${$$sanitized_props.class ?? ""}`;
  classesList = `${cList} ${justify} ${border} ${regionList}`;
  classesPanel = `${cPanel} ${regionPanel}`;
  $$payload.out += `<div${attr("class", `tab-group ${stringify(classesBase)}`)} data-testid="tab-group"><div${attr("class", `tab-list ${stringify(classesList)}`)} role="tablist"${attr("aria-labelledby", labelledby)}><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></div> `;
  if ($$slots.panel) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div${attr("class", `tab-panel ${stringify(classesPanel)}`)} role="tabpanel"${attr("aria-labelledby", panel)} tabindex="0"><!---->`;
    slot($$payload, $$props, "panel", {});
    $$payload.out += `<!----></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div>`;
  bind_props($$props, {
    justify,
    border,
    active,
    hover,
    flex,
    padding,
    rounded,
    spacing,
    regionList,
    regionPanel,
    labelledby,
    panel
  });
  pop();
}
function Tab($$payload, $$props) {
  const $$slots = sanitize_slots($$props);
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "group",
    "name",
    "value",
    "title",
    "controls",
    "regionTab",
    "active",
    "hover",
    "flex",
    "padding",
    "rounded",
    "spacing"
  ]);
  push();
  let selected, classesActive, classesBase, classesInterface, classesTab;
  let group = $$props["group"];
  let name = $$props["name"];
  let value = $$props["value"];
  let title = fallback($$props["title"], "");
  let controls = fallback($$props["controls"], "");
  let regionTab = fallback($$props["regionTab"], "");
  let active = fallback($$props["active"], () => getContext("active"), true);
  let hover = fallback($$props["hover"], () => getContext("hover"), true);
  let flex = fallback($$props["flex"], () => getContext("flex"), true);
  let padding = fallback($$props["padding"], () => getContext("padding"), true);
  let rounded = fallback($$props["rounded"], () => getContext("rounded"), true);
  let spacing = fallback($$props["spacing"], () => getContext("spacing"), true);
  const cBase = "text-center cursor-pointer transition-colors duration-100";
  const cInterface = "";
  function prunedRestProps() {
    delete $$restProps.class;
    return $$restProps;
  }
  selected = value === group;
  classesActive = selected ? active : hover;
  classesBase = `${cBase} ${flex} ${padding} ${rounded} ${classesActive} ${$$sanitized_props.class ?? ""}`;
  classesInterface = `${cInterface} ${spacing}`;
  classesTab = `${regionTab}`;
  $$payload.out += `<label${attr("class", clsx(classesBase))}${attr("title", title)}><div${attr("class", `tab ${stringify(classesTab)}`)} data-testid="tab" role="tab"${attr("aria-controls", controls)}${attr("aria-selected", selected)}${attr("tabindex", selected ? 0 : -1)}><div class="h-0 w-0 overflow-hidden"><input${spread_attributes({
    type: "radio",
    checked: group === value,
    name,
    value,
    ...prunedRestProps(),
    tabindex: "-1"
  })}></div> <div${attr("class", `tab-interface ${stringify(classesInterface)}`)}>`;
  if ($$slots.lead) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="tab-lead"><!---->`;
    slot($$payload, $$props, "lead", {});
    $$payload.out += `<!----></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <div class="tab-label"><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></div></div></div></label>`;
  bind_props($$props, {
    group,
    name,
    value,
    title,
    controls,
    regionTab,
    active,
    hover,
    flex,
    padding,
    rounded,
    spacing
  });
  pop();
}
export {
  TabGroup as T,
  Tab as a,
  html as h
};
