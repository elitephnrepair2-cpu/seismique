# Mini Golf + Arcade content and photography

Checked October 11, 2026.

- Official course page: https://www.seismique.com/mini-golf-arcade
- Visit information: https://www.seismique.com/visit
- Official ticket destination: https://order.toasttab.com/online/onlinetickets

The official course page lists 18 indoor glow mini golf holes, adult admission at $24.99, child admission at $21.99, arcade racing, basketball and air hockey, plus chess, dominoes and giant Jenga. Time-limited walk-in promotions were not copied into this redesign. Bundle pricing is linked to checkout rather than hard-coded here.

All six page photographs were imported from the official course page. `scripts/import-golf-assets.py` records their exact Wix media identifiers and produces responsive WebP assets. The filename `golf-players` contains the close-up alien obstacle; `golf-alien` contains families on the course. Alt text describes the actual photographs.

The maintained full-page template is `pages/mini-golf.html`. `scripts/build-pages.py` preserves this dedicated design, refreshes the shared footer, and emits `dist/mini-golf/index.html`. Styling is scoped through `.golf-page` or distinct golf classes; existing homepage and Museum styles are unchanged.
