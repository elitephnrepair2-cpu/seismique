"""Refresh the bar/events pages and shared links without replacing other page content."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
nav=(root/'components/navigation.html').read_text().strip()
footer=(root/'components/footer.html').read_text().strip()
for slug,component in [('parties','parties'),('whats-happening','happening'),('bar','bar')]:
 path=root/'dist'/slug/'index.html'
 html=path.read_text() if path.exists() else (root/'dist/whats-happening/index.html').read_text()
 content=(root/f'components/{component}-content.html').read_text()
 html=re.sub(r'<main id="main-content">.*?</main>',lambda _: '<main id="main-content">'+content+'</main>',html,flags=re.S)
 html=re.sub(r'<link rel="stylesheet" href="/assets/bar-events.css[^\"]*">\s*','',html)
 html=html.replace('</head>','<link rel="stylesheet" href="/assets/bar-events.css?v=1">\n</head>')
 if slug=='whats-happening':
  html=re.sub(r'/assets/calendar.js(?:\?[^\"]*)?','/assets/calendar.js?v=gm-1',html)
  html=re.sub(r'<meta name="description" content="[^"]*">','<meta name="description" content="Find Seismique events for adults and kids &amp; families, explore the calendar, and plan birthday parties or private gatherings.">',html)
 if slug=='bar':
  html=html.replace('<body class="hub-page">','<body class="hub-page bar-page">')
  html=re.sub(r'<title>.*?</title>','<title>The Drinque Bar | Seismique Houston</title>',html)
  html=re.sub(r'<meta name="description" content="[^"]*">','<meta name="description" content="Meet friends and watch games on the giant screen at The Drinque, your neighborhood bar at Seismique. Museum admission is not required to visit the bar.">',html)
  html=re.sub(r'<script src="/assets/calendar.js[^\"]*" defer></script>','',html)
  html=re.sub(r'<a class="button primary header-ticket".*?</a>','<a class="button primary" href="#bar-visit">VISIT THE BAR</a>',html,flags=re.S)
 path.parent.mkdir(exist_ok=True);path.write_text(html)
# Retain current page content, homepage delivery blocks, active-page labels and footer styling.
for path in [*root.glob('dist/**/index.html'),*root.glob('pages/*.html')]:
 html=path.read_text()
 if 'class="direct-nav"' not in html:continue
 slug=path.parent.name if path.parent.name!='dist' else ''
 if path.parent.name=='pages':slug=path.stem
 menu=nav.replace(f'href="/{slug}/"',f'href="/{slug}/" aria-current="page"') if slug else nav.replace('href="/plan-your-visit/"','href="#visit-room"')
 html=re.sub(r'<nav class="direct-nav".*?</nav>',lambda _:menu,html,flags=re.S)
 foot=footer
 if slug=='bar':
  foot=re.sub(r'<p class="sf-small-heading">HOURS</p>\s*<dl class="sf-hours">.*?</dl>','<p class="sf-small-heading">BAR VISITS</p><p>Call for current bar hours.</p>',foot,flags=re.S)
 html=re.sub(r'<!-- GLOBAL_FOOTER_START -->.*?<!-- GLOBAL_FOOTER_END -->',lambda _:'<!-- GLOBAL_FOOTER_START -->'+foot+'<!-- GLOBAL_FOOTER_END -->',html,flags=re.S)
 path.write_text(html)
print('Updated Bar, Events, party choices and shared navigation.')
