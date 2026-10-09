"""Generate independent static information pages from the maintained content sections."""
from pathlib import Path
import re
footer=Path('components/footer.html').read_text().strip()
def shared_footer(html):
 html=re.sub(r'<!-- GLOBAL_FOOTER_START -->.*?<!-- GLOBAL_FOOTER_END -->\s*','',html,flags=re.S)
 html=re.sub(r'<link rel="stylesheet" href="/assets/global-footer.css">\s*','',html)
 html=re.sub(r'<script src="/assets/global-footer.js" defer></script>\s*','',html)
 html=html.replace('</head>','<link rel="stylesheet" href="/assets/global-footer.css">\n</head>')
 return html.replace('</body>','<!-- GLOBAL_FOOTER_START -->'+footer+'<!-- GLOBAL_FOOTER_END -->\n<script src="/assets/global-footer.js" defer></script></body>')
source=shared_footer(Path('dist/index.html').read_text())
Path('dist/index.html').write_text(source)
head=source.split('</head>')[0]+'</head>'
header=re.search(r'<header class="site-header">.*?</header>',source,re.S).group()
header=re.sub(r'<div class="menu-settings">.*?</div>','',header,flags=re.S)
header=header.replace('Back to tour','Back to jungle')
header=re.sub(r'<a class="footer-shortcut".*?</a>','',header,flags=re.S)
dialog=re.search(r'<dialog class="exhibit-dialog".*?</dialog>',source,re.S).group()
ticketbar=re.search(r'<div class="global-ticketbar">.*?</div>',source,re.S).group()
pages={'exhibits':'Immersive Museum','mini-golf':'Mini Golf','parties':'Parties & Events','coming-soon':'Coming Soon','calendar':'Events Calendar','artists-team':'Artists & Team','overview':'Choose Your Experience','museum':'Museum Admission','plan-your-visit':'Plan Your Visit'}
planning=['tickets','hours-location','accessibility','faqs']
def links(text):
 def href(m):
  id=m.group(1)
  target='/?resume=1#tour' if id=='tour' else '/plan-your-visit/#'+id if id in planning else '/'+id+'/' if id in pages else '#'+id
  return 'href="'+target+'"'
 return re.sub(r'href="#([^"]+)"',href,text)
for id,title in pages.items():
 if id=='exhibits':
  template=Path('pages/exhibits.html');html=shared_footer(template.read_text());template.write_text(html)
  path=Path('dist/exhibits/index.html');path.parent.mkdir(exist_ok=True);path.write_text(html);continue
 section=re.search(r'<section id="'+id+r'".*?</section>',source,re.S).group()
 section=re.sub(r'<h2(.*?)>(.*?)</h2>',r'<h1\1>\2</h1>',section,count=1,flags=re.S)
 pagehead=re.sub(r'<title>.*?</title>','<title>'+title.replace('&','&amp;')+' | Seismique</title>',head)
 pagehead=pagehead.replace('</head>','<link rel="stylesheet" href="/assets/pages.css">\n</head>')
 scripts='<script src="/assets/visitor.js"></script>'
 if id=='exhibits':scripts+='<script src="/assets/exhibits.js"></script>'
 if id=='calendar':scripts+='<script src="/assets/calendar.js"></script>'
 html=pagehead+'<body class="information-page"><main aria-label="'+title.replace('&','&amp;')+'"><div id="seismique-jungle-reveal" data-view="info"><div class="phone">'+header+'<section class="visitor-content"><div class="content-inner">'+section+'</div></section>'+(dialog if id=='exhibits' else '')+ticketbar+'</div></div></main>'+scripts+'</body></html>'
 path=Path('dist')/id/'index.html';path.parent.mkdir(exist_ok=True);path.write_text(shared_footer(links(html)))
print('Generated',len(pages),'standalone pages')
