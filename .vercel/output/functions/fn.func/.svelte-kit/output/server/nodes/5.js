import * as server from '../entries/pages/_path_path_/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_path_path_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/[path=path]/+page.server.ts";
export const imports = ["_app/immutable/nodes/5.DgfWcoI7.js","_app/immutable/chunks/disclose-version.9MAgoEoo.js","_app/immutable/chunks/runtime.DhpGOksZ.js","_app/immutable/chunks/Audio.DtnWrXNT.js","_app/immutable/chunks/render.zzmf482g.js","_app/immutable/chunks/index.BaNpasK9.js","_app/immutable/chunks/index-client.DuvKaDBF.js","_app/immutable/chunks/this.CkImLRey.js","_app/immutable/chunks/legacy.KgxtM81z.js","_app/immutable/chunks/ConfettiLauncher.zpvo5VSK.js"];
export const stylesheets = ["_app/immutable/assets/Audio.c6i8ireL.css"];
export const fonts = [];
