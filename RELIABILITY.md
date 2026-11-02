# Walkthrough reliability

## Implemented controls

- One animation loop and progress owner; hidden tabs, menus and visitor information suspend rendering.
- Bounded cooperative preparation, idle-timer recovery and optional sky-image fallback. The camera does not enter unfinished scenery.
- Adaptive effects first: fewer decorative particles/arcs and 20–24 Hz secondary updates under sustained pressure. Camera timing remains independent. Pixel scaling remains bounded and never changes DOM text resolution. Shader-light counts stay fixed to avoid recompilation during travel.
- A UI-bundle watchdog offers native links to Museum, Mini Golf and Plan Your Visit after 30 foreground seconds without preparation/progress milestones. It does not count reading time at a settled destination, open menus or time in another app. It also watches a requested transition waiting for distant scenery.
- Script errors, preparation failures and graphics-context loss expose the same links immediately. A context loss suspends the scene; Retry tour restarts it cleanly. No forced reload, no camera jump into an unprepared world.
- Published content-addressed scripts are retained for cached pages and Safari restores.

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

## Remaining limits

- Scene generation and some GPU uploads still execute on the main thread. Cooperative yields reduce stalls but cannot preempt one expensive browser/GPU operation.
- The watchdog provides access rather than forcibly resolving a hung shader compiler or pretending the full tour is ready.
- Real visitor aggregation and alerting are not installed. Adding a collector requires a separate choice of service, retention and privacy approach.
- No physical phone/browser farm is connected. Do not describe simulated failure tests as physical-device certification.
