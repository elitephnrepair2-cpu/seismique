# Seismique website

A cinematic website concept featuring an interactive entrance portal, a bioluminescent jungle journey, a galaxy ceiling, and destination links to museum, mini golf, events, and visitor information.

[View the current website](https://seismique-portal-walkthrough.gashandy.chatgpt.site/)

This copy contains published version 64 from October 21, 2026. It includes the automatic cinematic entrance with Skip Intro, four visitor-controlled jungle destinations with NEXT/swipe/scroll navigation, a shorter afterglow ending, mobile controls and visitor-information flow, the redesigned Museum and Mini Golf pages, and consolidated navigation.

## Run locally

Install Python 3 if it is not already available, then run this command from the repository folder:

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000 in a browser. Serve the `dist` folder rather than opening `index.html` directly: page and asset links begin at the site root.

## Files

- `dist/` — the complete static website, ready to serve.
- `dist/index.html` — homepage portal and jungle scene.
- `dist/assets/` — JavaScript, styles, and bundled visual assets.
- `pages/` — editable Museum and Mini Golf page templates and asset sources.
- `components/` — shared navigation, footer, page content, and final visitor-information room.
- `scripts/build-pages.py` — regenerates the standalone pages and shared footer.
- `CONTENT_REVIEW.md` and `EXHIBIT_PHOTOS.json` — content references and image sources.
- `docs/DEVELOPMENT_HISTORY.md` — implementation notes from the design work.

After editing the templates or footer, run:

```sh
python3 scripts/build-pages.py
```

Behavioral checks are available in `scripts/check-*.cjs` and `scripts/check-navigation.py` (Node.js and Python 3).

There is no Node package installation or build step required to serve the existing `dist` output.

## Hosting

Use `dist` as the publish directory on a static host that serves this site at the root of its domain. The GitHub repository is a source copy; uploading it does not change the current live website or automatically enable GitHub Pages.

Some exhibit photographs and fonts load from existing external URLs, so those assets need an internet connection. Ticket and contact links retain their existing external destinations.

The source snapshot corresponds to commit `205ab92f5f3fe4072e4635ada96df1779cddd00f` in the original site repository. Hosting credentials and provider-specific deployment identity are not included.
