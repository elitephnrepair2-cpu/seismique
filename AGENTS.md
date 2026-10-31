# Homepage delivery build

Editable homepage logic remains in `dist/assets/journey-scene.js` and the separate helper files. `dist/index.html` is editable outside the `journey:*` generated comment blocks.

After changing homepage scripts, CSS, or HTML, run `npm run build:journey` before checks and publication. It regenerates the compressed content-addressed UI, entrance and deferred-jungle bundles, inline homepage styles, delivery manifest and matching Vercel cache headers. Do not edit generated hashed bundles directly.

Run `node scripts/check-network-loading.cjs` alongside the relevant journey tests. The other test scripts still inspect the readable original sources via `scripts/read-journey-source.cjs`.
