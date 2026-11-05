# Walkthrough reliability

## Implemented controls

- The initial loading state now covers complete entrance/jungle preparation and GPU warmup. Camera travel and portal power-up start together only when that preparation is ready. The old .26-progress readiness brake is removed: slow loading cannot start the opening, stop it halfway, then restart it. Menus, tickets and recovery links remain accessible during loading. Restoring a farther destination waits for its scenery before revealing the canvas.
- Bark, stone and path surface pixels are generated during `build:journey`, then loaded as four immutable PNGs totaling 98,210 bytes. Decoded pixels are verified against the original procedural maps. Failed/stalled image requests use stable lightweight maps; late images are disposed, avoiding surprise texture uploads during travel.
- The deferred jungle script is preloaded at low priority alongside the entrance download, while remaining outside the parser-blocking dependency chain.
- One animation loop and progress owner; hidden tabs, menus and visitor information suspend rendering.
- Bounded cooperative preparation, idle-timer recovery and optional sky-image fallback. The camera does not enter unfinished scenery.
- Adaptive effects first: fewer decorative particles/arcs and 20–24 Hz secondary updates under sustained pressure. Camera timing remains independent. Pixel scaling remains bounded and never changes DOM text resolution. Shader-light counts stay fixed to avoid recompilation during travel.
- A UI-bundle watchdog offers native links to Museum, Mini Golf and Plan Your Visit after 30 foreground seconds without preparation/progress milestones. It does not count reading time at a settled destination, open menus or time in another app. It also watches a requested transition waiting for distant scenery.
- Script errors, preparation failures and graphics-context loss expose the same links immediately. A context loss suspends the scene; Retry tour restarts it cleanly. No forced reload, no camera jump into an unprepared world.
- Published content-addressed scripts are retained for cached pages and Safari restores.
- Tree-groove centers are calculated once per mesh row, with wrapped angular distances replacing repeated trigonometry. Golden checks cover unchanged position, UV and normal buffers for trunks, boughs and twigs at both detail levels. Browsers without idle callbacks use browser-clamped zero-delay scheduling rather than an extra 16 ms pause per bounded preparation slice. Camera timing, tree counts and rendering resolution are unchanged by this optimization.
- After the entrance canopy is ready, future-tree construction, batching and uploads wait until the first destination settles. The eight-tree opening still fully prepares and warms before crossing. Early Next intent remains queued until the farther scenery is ready; background work also rests during later camera transitions.

## Diagnostics

`journey-health.js` keeps only the latest 24 stage/recovery events and 12 animation samples in memory. A compact last-visit report is written to **sessionStorage** at most once per five seconds and on page hide. Key: `seismique-journey-health`.

It records foreground timings, preparation milestones, first-destination completion, recovery codes, FPS, slow frames, render scale and effects level. It contains no account IDs, full URLs, user-agent strings or contact details. It makes **no network requests**. Storage denial does not affect navigation. This is local debugging, not fleet-wide production monitoring.

DOM diagnostics on `#seismique-jungle-reveal`: `data-health-status`, `data-health-fps`, `data-health-max-frame-ms`, `data-effects-level`, existing preparation states, and `data-recovery` when direct navigation is offered. Optional `?profile=1` retains the more detailed CPU/draw-call test view.

## Release gate

1. Run `npm run build:journey`, then `npm run check:journey` and `git diff --check`.
2. Browser-check the opening through the first destination; open the Museum page; test Next, a reverse gesture, Menu, tickets and Plan Your Visit.
3. Test fresh and cached loads. Deliberately hold the entry download beyond 30 seconds: usable recovery links must appear and navigate without the 3D script. Delayed optional sky images must not block the jungle.
4. Check app switching/tab restoration and orientation changes. For actual WebGL context loss, direct links must remain usable and Retry must restart cleanly.
5. Confirm successful publication on both Sites and Vercel; retain older hashed bundles.

## Actual-device acceptance still required

Use iPhone 11 Safari, a current iPhone Safari, an iPad, a budget Android Chrome, and desktop Safari/Chrome/Firefox. Test a first uncached visit, repeat visit, slow connection, portrait/landscape and switching apps. Browser viewport testing is **not** physical-device verification. Compare stage completion and animation measurements, not only a visual screenshot.

Proposed acceptance targets: useful visible content within 2.5 seconds on normal mobile connections; full intro completes rather than silently stalls; sustained animation at least 30 FPS on older supported hardware with no repeated long freezes; navigation and tickets available even when WebGL fails. These are targets, not certified results or guarantees on every device/network.

## November 4 opening verification

The previous controller reproduced 4.65 seconds of almost-stopped camera movement with a 12-second readiness delay. Regression checks now cover 0/3/6/12/25-second readiness delays and require the same uninterrupted 9.17-second visible opening after each delay, plus existing skip, reduced-motion, reverse, pause and return behavior.

On the local in-app browser at 414 × 896, the prepared opening became visible at 0.77 seconds and reached the first destination at 9.93 seconds; its maximum recorded moving-frame interval was 25.1 ms. With the jungle script deliberately delayed 12 seconds by a separate local HTTP server, it became visible at 12.62 seconds and reached the first destination at 21.78 seconds; maximum moving-frame interval was 9.3 ms. These are measurements on this computer, not iPhone performance claims. iPhone 11 and iPhone 17 Pro Max Safari acceptance remains outstanding.

## November 4 startup-speed follow-up

Covered startup now uses bounded six-millisecond preparation slices with immediate timer scheduling, rather than waiting for background idle frames. The hidden animation loop sleeps until the complete scene is ready. Initial GPU warmup uses the covered canvas in its real output format, avoiding a second set of linear offscreen shader programs; all later warmups remain offscreen. Surface and sky image downloads start from low-priority HTML preloads. Visual assets, tree counts, rendering resolution and the full opening readiness gate are preserved.

At 414 × 896 in the local in-app browser, the instrumented baseline became visible at 1,136 ms on the first load and 930 ms on repeat. The final build measured 702 ms and 623 ms (25–33% less than the repeat baseline). Maximum moving-frame intervals in those final runs were 15.7 and 16.7 ms. These are small-sample measurements on this computer, not iPhone/Safari or mobile-network results. The complete journey release gate passes, including cancelled urgent work, covered rendering suspension, and successful/failed GPU warmup with render-state restoration.

## Remaining limits

- Scene generation and some GPU uploads still execute on the main thread. Cooperative yields reduce stalls but cannot preempt one expensive browser/GPU operation.
- The watchdog provides access rather than forcibly resolving a hung shader compiler or pretending the full tour is ready.
- Real visitor aggregation and alerting are not installed. Adding a collector requires a separate choice of service, retention and privacy approach.
- No physical phone/browser farm is connected. Do not describe simulated failure tests as physical-device certification.
