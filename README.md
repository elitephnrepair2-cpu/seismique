# Seismique website

A cinematic website concept featuring an interactive entrance portal, a bioluminescent jungle journey, a galaxy ceiling, and destination links to museum, mini golf, events, and visitor information.

[View the current website](https://seismique-portal-walkthrough.gashandy.chatgpt.site/)

This copy contains the published version 44 from October 8, 2026, including the richer jungle lighting, organic Alien Grass-inspired destination accents, final portal, redesigned Exhibits page, and shared footer.

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
- `pages/exhibits.html` — the editable cinematic Exhibits page template.
- `components/footer.html` — the shared footer source.
- `scripts/build-pages.py` — regenerates the standalone pages and shared footer.
- `CONTENT_REVIEW.md` and `EXHIBIT_PHOTOS.json` — content references and image sources.
- `docs/DEVELOPMENT_HISTORY.md` — implementation notes from the design work.

After editing the templates or footer, run:

```sh
python3 scripts/build-pages.py
```

There is no Node package installation or build step required to serve the existing `dist` output.

## Hosting

Use `dist` as the publish directory on a static host that serves this site at the root of its domain. The GitHub repository is a source copy; uploading it does not change the current live website or automatically enable GitHub Pages.

Some exhibit photographs and fonts load from existing external URLs, so those assets need an internet connection. Ticket and contact links retain their existing external destinations.

The source snapshot corresponds to commit `804a73962d391a829eed37fcdb5d11506e59e109` in the original site repository. Hosting credentials and provider-specific deployment identity are not included.
