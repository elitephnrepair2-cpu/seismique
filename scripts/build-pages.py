"""Build five customer-facing pages with one maintained navigation component."""
from pathlib import Path
from html import escape
import re

nav=Path('components/navigation.html').read_text().strip()
header=Path('components/page-header.html').read_text().strip()
footer=Path('components/footer.html').read_text().strip()
pages={'exhibits':'Immersive Museum','mini-golf':'Glow Mini Golf','bar':'Bar','parties':'Parties & Events','plan-your-visit':'Plan Your Visit'}
legacy={'whats-happening':'/plan-your-visit/','coming-soon':'/plan-your-visit/','calendar':'/plan-your-visit/','artists-team':'/exhibits/#meet-artists','overview':'/','museum':'/exhibits/'}
planning={'tickets','hours-location','parking','accessibility','faqs','contact','policies'}

def navigation(html,current=None,home=False):
 menu=nav
 if current:menu=menu.replace('href="/'+current+'/"','href="/'+current+'/" aria-current="page"')
 if home:menu=menu.replace('href="/plan-your-visit/"','href="#visit-room"')
 html=re.sub(r'<nav class="direct-nav".*?</nav>',menu,html,flags=re.S)
 html=html.replace('/?resume=1#tour','/').replace('Seismique — back to the jungle','Seismique — home')
 html=re.sub(r'/assets/visitor.js(?:\?v=\d+)?','/assets/visitor.js?v=59',html)
 html=re.sub(r'<link rel="stylesheet" href="/assets/navigation.css[^\"]*">\s*','',html)
 return html.replace('</head>','<link rel="stylesheet" href="/assets/navigation.css?v=menu-color-1">\n</head>')

def shared_footer(html):
 html=re.sub(r'<!-- GLOBAL_FOOTER_START -->.*?<!-- GLOBAL_FOOTER_END -->\s*','',html,flags=re.S)
 html=re.sub(r'<link rel="stylesheet" href="/assets/global-footer.css(?:\?[^"]*)?">\s*','',html)
 html=re.sub(r'<script src="/assets/global-footer.js" defer></script>\s*','',html)
 html=html.replace('</head>','<link rel="stylesheet" href="/assets/global-footer.css?v=logo-outline-1">\n</head>')
 return html.replace('</body>','<!-- GLOBAL_FOOTER_START -->'+footer+'<!-- GLOBAL_FOOTER_END -->\n<script src="/assets/global-footer.js" defer></script></body>')

def links(html,current):
 def href(m):
  id=m.group(1)
  if id==current or (current=='whats-happening' and id in {'calendar','upcoming','offers','announcements'}):return m.group()
  if id in planning:return m.group() if current=='plan-your-visit' else 'href="/plan-your-visit/#'+id+'"'
  target='/' if id=='tour' else legacy.get(id) or ('/'+id+'/' if id in pages else None)
  return 'href="'+target+'"' if target else m.group()
 html=re.sub(r'href="#([^"]+)"',href,html)
 for old,target in legacy.items():html=html.replace('href="/'+old+'/"','href="'+target+'"')
 return html

home=Path('dist/index.html').read_text()
home=re.sub(r'<!-- VISIT_ROOM_START -->.*?<!-- VISIT_ROOM_END -->','<!-- VISIT_ROOM_START -->'+Path('components/visit-room.html').read_text()+'<!-- VISIT_ROOM_END -->',home,flags=re.S)
Path('dist/index.html').write_text(navigation(home,home=True))
for id,title in pages.items():
 if id in ('exhibits','mini-golf'):
  template=Path('pages')/(id+'.html');html=template.read_text()
  html=re.sub(r'<header class="experience-header">.*?</header>',header,html,flags=re.S)
  html=re.sub(r'<link rel="stylesheet" href="/assets/consolidated-pages.css[^\"]*">\s*','',html)
  html=html.replace('</head>','<link rel="stylesheet" href="/assets/consolidated-pages.css?v=55">\n</head>')
  html=navigation(shared_footer(links(html,id)),id);template.write_text(html)
 else:
  fragment={'bar':'bar','parties':'parties','plan-your-visit':'visit','whats-happening':'happening'}[id]
  content=Path('components/'+fragment+'-content.html').read_text()
  if id not in ('whats-happening','parties','bar'):content='<div class="info-shell">'+content+'</div>'
  description={'bar':'Meet friends and watch games at The Drinque. Museum admission is not required to visit the bar.','parties':'Plan a birthday, private celebration or corporate event at Seismique in Houston.','plan-your-visit':'Plan your Seismique visit: tickets, Houston address, hours, parking, accessibility, FAQs and contact details.','whats-happening':'Find Seismique events for adults and kids &amp; families, with event dates and registration links.'}[id]
  html='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>'''+escape(title)+''' | Seismique</title><meta name="description" content="'''+description+'''"><link rel="stylesheet" href="/assets/exhibits-experience.css?v=49"><link rel="stylesheet" href="/assets/consolidated-pages.css?v=55"></head><body class="hub-page"><div id="seismique-jungle-reveal" data-view="info"><a class="skip-link" href="#main-content">Skip to content</a>'''+header+'''<main id="main-content">'''+content+'''</main></div><script src="/assets/visitor.js?v=59" defer></script>'''+('<script src="/assets/calendar.js?v=gm-1" defer></script>' if id=='whats-happening' else '')+'''</body></html>'''
  html=navigation(shared_footer(links(html,id)),id)
  if id=="parties":
   html=html.replace("</head>",'<link rel="stylesheet" href="/assets/events-experience.css?v=3">\n</head>')
   html=html.replace("</body>",'<script src="/assets/events-inquiry.js?v=3" defer></script>\n</body>')
 path=Path('dist')/id/'index.html';path.parent.mkdir(exist_ok=True);path.write_text(html)
# Legacy URLs only forward visitors; they no longer expose extra pages or menus.
for old,target in legacy.items():
 path=Path('dist')/old/'index.html';path.parent.mkdir(exist_ok=True)
 path.write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url='+target+'"><link rel="canonical" href="'+target+'"><title>Seismique</title></head><body><p>This content has a new home. <a href="'+target+'">Continue to Seismique</a>.</p><script>location.replace('+repr(target)+');</script></body></html>')
print('Built five main pages, shared navigation, and six legacy URL redirects.')

# Keep the focused GM content/navigation refresh authoritative.
exec(compile(Path('scripts/build-bar-events.py').read_text(), 'scripts/build-bar-events.py', 'exec'), {'__file__': str(Path('scripts/build-bar-events.py').resolve())})
