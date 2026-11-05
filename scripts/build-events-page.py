"""Refresh the events body and assets without rebuilding unrelated pages."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
p=root/'dist/parties/index.html'
html=p.read_text()
content=(root/'components/parties-content.html').read_text()
html,n=re.subn(r'<main id="main-content">.*?</main>',lambda _: '<main id="main-content">'+content+'</main>',html,flags=re.S)
assert n==1,'Expected one events main content block'
html=re.sub(r'<link rel="stylesheet" href="/assets/events-experience.css[^\"]*">\s*','',html)
html=re.sub(r'<script src="/assets/events-inquiry.js[^\"]*" defer></script>\s*','',html)
html=html.replace('</head>','<link rel="stylesheet" href="/assets/events-experience.css?v=1">\n</head>')
html=html.replace('</body>','<script src="/assets/events-inquiry.js?v=1" defer></script>\n</body>')
p.write_text(html)
print('Built events page from the maintained content component.')
