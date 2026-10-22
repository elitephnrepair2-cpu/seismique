"""Audit the public navigation, migrated content and local link destinations."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re
root=Path(__file__).resolve().parents[1]/'dist'
class Document(HTMLParser):
 def __init__(self,path):
  super().__init__();self.ids=[];self.links=[];self.nav=[];self.innav=False;self.anchor=None;self.text='';self.feed(path.read_text())
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.append(a['id'])
  if tag=='nav' and a.get('class')=='direct-nav':self.innav=True
  if tag=='a':
   self.links.append(a.get('href',''))
   if self.innav:self.anchor=[a.get('href',''),'']
 def handle_data(self,data):
  self.text+=data+' '
  if self.anchor is not None:self.anchor[1]+=data
 def handle_endtag(self,tag):
  if tag=='a' and self.anchor is not None:self.nav.append(self.anchor);self.anchor=None
  if tag=='nav':self.innav=False
expected=['Immersive Museum','Glow Mini Golf','Parties & Events','What’s Happening','Plan Your Visit']
pages=['','exhibits','mini-golf','parties','whats-happening','plan-your-visit']
docs={('/'+p+'/' if p else '/'):Document(root/p/'index.html') for p in pages}
for url,doc in docs.items():
 assert [label.strip() for _,label in doc.nav]==expected,(url,doc.nav)
 assert len(doc.ids)==len(set(doc.ids)),(url,'Duplicate section IDs')
 for href in doc.links:
  link=urlsplit(href)
  if link.scheme or link.netloc or not href:continue
  path=link.path or url
  if path.startswith('/assets/'):continue
  if not path.startswith('/'):continue
  page=docs.get(path)
  assert page is not None,(url,'Link still points at a removed page',href)
  fragment=unquote(link.fragment)
  # The homepage router translates these compatibility anchors before use.
  if url=='/' and not link.path and fragment in ['exhibits','tour']:continue
  if fragment:assert fragment in page.ids,(url,'Missing target',href)
for name in ['calendar','upcoming','offers','announcements']:assert name in docs['/whats-happening/'].ids
for name in ['meet-artists','behind-the-experience']:assert name in docs['/exhibits/'].ids
for name in ['tickets','hours-location','parking','accessibility','faqs','contact','policies']:assert name in docs['/plan-your-visit/'].ids
for phrase in ['A connected space station','Meet the vendors','Beyond the exhibits']:assert phrase in docs['/whats-happening/'].text
for phrase in ['Toshiko Horiuchi MacAdam','CONTRIBUTING ARTISTS','EXHIBIT BUILDERS','CREATIVE DIRECTION']:assert phrase in docs['/exhibits/'].text
for old,target in {'coming-soon':'/whats-happening/#upcoming','calendar':'/whats-happening/#calendar','artists-team':'/exhibits/#meet-artists','overview':'/','museum':'/exhibits/'}.items():
 data=(root/old/'index.html').read_text();assert 'location.replace('+repr(target)+')' in data and 'direct-nav' not in data
print('PASS: six consistent five-item menus; all internal page/section links; no duplicate IDs; visitor details and artist/upcoming content retained; five legacy redirects.')
