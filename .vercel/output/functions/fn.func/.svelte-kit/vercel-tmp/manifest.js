export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["audio/beyond-the-cloudy-sky-shutterstock.mp3","audio/SMALL_CROWD_APPLAUSE-Yannick_Lemieux-1268806408.mp3","audio/Tick-DeepFrozenApps-397275646.mp3","favicon.ico","images/arrow-img.png","images/balloon-1.png","images/balloon-10.png","images/balloon-2.png","images/balloon-3.png","images/balloon-4.png","images/balloon-5.png","images/balloon-6.png","images/balloon-7.png","images/balloon-8.png","images/balloon-9.png","images/icons/apple-touch-icon-180x180.png","images/icons/favicon.ico","images/icons/favicon.svg","images/icons/maskable-icon-512x512.png","images/icons/pwa-192x192-2.png","images/icons/pwa-192x192.png","images/icons/pwa-512x512-2.png","images/icons/pwa-512x512.png","images/icons/pwa-64x64-2.png","images/icons/pwa-64x64.png","images/logo-dark-background-38.png","images/pwa-64x64.png","images/sveltewheel.webp","Quicksand.ttf","robots.txt"]),
	mimeTypes: {".mp3":"audio/mpeg",".png":"image/png",".svg":"image/svg+xml",".webp":"image/webp",".ttf":"font/ttf",".txt":"text/plain"},
	_: {
		client: {"start":"_app/immutable/entry/start.gLR7Il2d.js","app":"_app/immutable/entry/app.CP1oew1e.js","imports":["_app/immutable/entry/start.gLR7Il2d.js","_app/immutable/chunks/entry.9GQ_1GQS.js","_app/immutable/chunks/index-client.DuvKaDBF.js","_app/immutable/chunks/runtime.DhpGOksZ.js","_app/immutable/chunks/index.BaNpasK9.js","_app/immutable/entry/app.CP1oew1e.js","_app/immutable/chunks/preload-helper.Bd2dpRG3.js","_app/immutable/chunks/runtime.DhpGOksZ.js","_app/immutable/chunks/this.CkImLRey.js","_app/immutable/chunks/store.Cn1dDG1t.js","_app/immutable/chunks/index-client.DuvKaDBF.js","_app/immutable/chunks/render.zzmf482g.js","_app/immutable/chunks/disclose-version.9MAgoEoo.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/5.js'))
		],
		routes: [
			{
				id: "/api/wheels",
				pattern: /^\/api\/wheels\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/wheels/_server.ts.js'))
			},
			{
				id: "/api/wheels/[path=path]",
				pattern: /^\/api\/wheels\/([^/]+?)\/?$/,
				params: [{"name":"path","matcher":"path","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/wheels/_path_path_/_server.ts.js'))
			},
			{
				id: "/thumbnails/[path=path]",
				pattern: /^\/thumbnails\/([^/]+?)\/?$/,
				params: [{"name":"path","matcher":"path","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/thumbnails/_path_path_/_server.ts.js'))
			},
			{
				id: "/[path=path]",
				pattern: /^\/([^/]+?)\/?$/,
				params: [{"name":"path","matcher":"path","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			const { match: path } = await import ('../output/server/entries/matchers/path.js')
			return { path };
		},
		server_assets: {}
	}
}
})();
