"""Build the artist directory from the imported, editable artist profiles."""
from pathlib import Path
from html import escape
import json
import re

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'content/artists.json').read_text())
artists = data['artists']
cards = []
for artist in artists:
    name = escape(artist['name'])
    paragraphs = ''.join('<p>' + escape(p.strip()) + '</p>' for p in re.split(r'\n\s*\n', artist['bio']) if p.strip())
    profile = ''
    if artist.get('profile_url'):
        label = 'Instagram' if 'instagram.com/' in artist['profile_url'] else 'Artist website'
        profile = '<a class="text-link artist-profile-link" href="' + escape(artist['profile_url'], quote=True) + '" target="_blank" rel="noopener noreferrer">' + label + '<span aria-hidden="true"> ↗</span><span class="sr-only"> for ' + name + ' (opens in a new tab)</span></a>'
    cards.append(f'''<article class="directory-card" id="artist-{artist['id']}" aria-labelledby="artist-name-{artist['id']}">
      <div class="directory-portrait"><img src="{escape(artist['image'], quote=True)}" alt="{name}" width="298" height="298" loading="lazy" decoding="async"></div>
      <div class="directory-card-copy"><h2 id="artist-name-{artist['id']}">{name}</h2>
      <details class="artist-biography"><summary>Read biography<span class="bio-chevron" aria-hidden="true"></span></summary><div class="artist-biography-copy">{paragraphs}{profile}</div></details></div>
    </article>''')

template = (root / 'pages/exhibits.html').read_text()
head = template.split('<body>', 1)[0]
head = re.sub(r'<title>.*?</title>', '<title>Artist Directory | Seismique</title>', head)
head = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Meet the artists and makers behind Seismique. Explore their portraits, biographies and creative work in the artist directory.">', head)
head = head.replace('</head>', '<link rel="stylesheet" href="/assets/artist-directory.css?v=1">\n</head>')
header = re.search(r'<header class="experience-header">.*?</header>', template, re.S).group()
header = header.replace(' aria-current="page"', '')
footer = re.search(r'<!-- GLOBAL_FOOTER_START -->.*?<!-- GLOBAL_FOOTER_END -->', template, re.S).group()
html = head + f'''<body class="artist-directory-page"><div id="seismique-jungle-reveal" data-view="info">
<a class="skip-link" href="#main-content">Skip to content</a>{header}
<main id="main-content" class="directory-main">
  <header class="directory-intro">
    <a class="directory-back" href="/exhibits/#meet-artists"><span aria-hidden="true">←</span> Back to the museum</a>
    <p class="eyebrow accent">THE PEOPLE BEHIND THE WORLDS</p>
    <h1>MEET THE<br><span>ARTISTS.</span></h1>
    <p class="directory-description">Meet the artists and makers whose ideas, craft and curiosity bring Seismique to life.</p>
  </header>
  <div class="directory-toolbar" hidden>
    <form class="directory-search" role="search" aria-label="Artist directory">
      <label for="artist-search">Find an artist</label>
      <div class="directory-search-field"><input id="artist-search" type="search" placeholder="Search by name or creative work" autocomplete="off" aria-controls="artist-grid"><button type="reset" class="search-clear" hidden>Clear</button></div>
    </form>
    <p id="artist-count" role="status" aria-live="polite">{len(artists)} artist profiles</p>
  </div>
  <div id="artist-grid" class="directory-grid">{''.join(cards)}</div>
  <div class="directory-empty" hidden><h2>No artists found.</h2><p>Try another name or creative medium.</p><button class="button secondary" type="button" id="show-all-artists">Show all artists</button></div>
  <div class="directory-return"><p>See their creativity in person.</p><a class="button secondary" href="/exhibits/">Explore the museum <span aria-hidden="true">↗</span></a></div>
</main></div>
<script src="/assets/visitor.js?v=59" defer></script>
<script src="/assets/artist-directory.js?v=1" defer></script>
{footer}
<script src="/assets/global-footer.js" defer></script></body></html>'''
for path in (root / 'pages/artists.html', root / 'dist/artists/index.html'):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(html)
print(f'Built artist directory with {len(artists)} profiles.')
