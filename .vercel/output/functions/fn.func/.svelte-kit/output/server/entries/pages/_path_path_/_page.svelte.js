import { ac as head, a0 as escape_html, S as pop, $ as attr, _ as stringify, Q as push } from "../../../chunks/index.js";
import { g as getModalStore, w as wheelStore } from "../../../chunks/Audio.js";
import { W as Wheel_1 } from "../../../chunks/Wheel2.js";
import "canvas-confetti";
function _page($$payload, $$props) {
  push();
  let { data } = $$props;
  const { wheel } = data;
  getModalStore();
  wheelStore.config = wheel.config;
  wheelStore.setNewEntries(wheel.entries);
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>${escape_html(wheel.config.title)} -  Pop It Wheel | Random Question Generator</title>`;
    $$payload2.out += `<meta name="title"${attr("content", wheel.config.title)}> <meta property="og:title"${attr("content", wheel.config.title)}> `;
    if (wheel.config.description) {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<meta name="description"${attr("content", wheel.config.description)}> <meta property="og:description"${attr("content", wheel.config.description)}>`;
    } else {
      $$payload2.out += "<!--[!-->";
      $$payload2.out += `<meta name="description" content="Spin this custom wheel and get a random result!"> <meta property="og:description" content="Spin this custom wheel and get a random result!">`;
    }
    $$payload2.out += `<!--]--> <meta property="og:url"${attr("content", `https://sveltewheel.com/${stringify(wheel.path)}`)}> <meta property="og:image"${attr("content", `https://sveltewheel.com/thumbnails/${stringify(wheel.path)}`)}> <meta name="twitter:card" content="summary_large_image"> <meta name="theme-color"${attr("content", wheel.config.colors.at(0))}>`;
  });
  $$payload.out += `<div class="min-h-screen flex flex-col"><main class="flex-grow flex flex-col xl:grid grid-cols-6"><div class="col-span-1 pb-0 p-4 xl:pb-4 xl:pr-0 flex flex-col"><h2 class="text-3xl">${escape_html(wheel.config.title)}</h2> <p class="text-lg">${escape_html(wheel.config.description)}</p></div> <div class="col-span-4 flex-1 flex flex-col justify-center items-center">`;
  Wheel_1($$payload);
  $$payload.out += `<!----></div> <div class="col-span-1 pt-0 p-4 xl:pt-4 xl:pl-0"></div></main></div>`;
  pop();
}
export {
  _page as default
};
