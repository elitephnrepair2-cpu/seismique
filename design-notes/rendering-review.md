# Loading and mobile clarity review — October 30, 2026

## Confirmed source findings

- The old phone budget began at 1.15 render pixels per CSS pixel and could fall to 0.9, with antialiasing disabled. Both settings contributed to soft and jagged output on Retina screens.
- The galaxy evaluated three four-octave cloud-noise fields per fragment on every frame. Those clouds move extremely slowly; repeatedly computing them was disproportionate to their visual change.
- Sculpted branches often encode world locations in their vertices while their object origins remain at zero. Earlier origin-based batching combined distant branches and weakened frustum culling.
- The main HTML included approximately 160 KB of scene implementation, forcing that code to be transferred as part of every document response.

## Implemented changes

- Mobile starts at render ratio 1.5, bounded by the display's actual ratio. Healthy devices can recover to 1.75. The protected phone floor is 1.25, also bounded by native display density. Desktop limits remain unchanged. Quality adjustments still wait for a settled camera.
- Enable hardware antialiasing. No extra sharpening filter or full-screen postprocessing pass.
- Bake two 1024×512 sRGB nebula textures once: canopy and final horizon. Live rendering blends the cached clouds. Stars, their twinkle, and meteors remain live, with reduced-motion behavior retained. Approximate color storage: 4 MiB plus driver overhead. No downloaded galaxy artwork.
- Batch geometry by its actual transformed bounds center, preserving local culling and every original vertex/material.
- Extract scene code into a versioned deferred script. The HTML is about 23 KB, approximately 87% smaller. Total application JavaScript is not reduced by extraction; it becomes independently cacheable. Preload the renderer and scene script. The lightweight loading identity renders before 3D initialization.
- Add long browser caching for the versioned renderer/scene files on Vercel. Bump query versions whenever changing those files; renderer is pinned with `?v=160`.

## Local verification evidence

A desktop Chrome browser at 414×896 CSS pixels, actual device-pixel ratio 1, on a cached localhost reload reported:

- First contentful paint: 40 ms
- First 3D frame: 232 ms
- GPU preparation complete: 2,818 ms
- Hardware antialiasing: active
- Cached sky: active
- Idle first-destination rendering: approximately 118 FPS
- Frame CPU p95: 7.90 ms; this measures CPU submission, not GPU completion
- No graphics errors in the browser console

These are local engineering measurements, not iPhone 11, Safari, cold-network, or cellular results. They do not establish a universal load-time or frame-rate guarantee. Physical-phone checks should compare cold opening, portal crossing, each destination transition, fine floor/bark edges, and the final sky.

Regression checks cover the protected mobile resolution, native-density bounds, one-time galaxy cache, live stars, GPU state restoration, actual geometry-location batching, camera/effects cadence, safe-area layout, gesture isolation, scene readiness, route continuity, and navigation integrity.
