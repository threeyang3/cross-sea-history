"""Merge explicitly selected bilingual culture additions without rewriting older articles."""
import json, math, re, shutil, hashlib, sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
data=root/'app/data'
timeline=json.loads((data/'timeline.json').read_text())
catalog=json.loads((data/'catalog.json').read_text())
manifest=json.loads((data/'article-manifest.json').read_text())
rights=json.loads((data/'image-rights.json').read_text())
old_sources=json.loads((data/'article-sources.json').read_text())
batches=[json.loads(Path(name).read_text()) for name in sys.argv[1:]]
assert batches, 'Provide content batch files'
new_sources=[source for batch in batches for source in batch['sources']]
sources={s['id']:s for s in catalog['sources']+timeline['sources']+old_sources+new_sources}
articles={key:value for batch in batches for key,value in batch['articles'].items()}
events=[event for batch in batches for event in batch['events']]
assert len({e['id'] for e in events})==len(events)
assert set(articles)=={e['id'] for e in events}
def check_pair(value):
 assert all(isinstance(value.get(lang),str) and value[lang].strip() for lang in ['zh','ja']),value
for source in new_sources:
 assert source['url'].startswith('https://')
 for key in ['title','kind','claim']:check_pair(source[key])
for event in events:
 for key in ['date','title','summary','significance','question','location']:check_pair(event[key])
 assert event['track'] in ['china','exchange'] and event['start']!=0
 assert event.get('end',event['start'])>=event['start']
 assert all(s in sources for s in event['sourceIds'])
 article=articles[event['id']]
 assert len(article['sections'])>=3 and article['evidence'] and article['terms']
 pairs=[article['thesis'],article['discussion']['body']]
 for section in article['sections']:
  check_pair(section['title']);pairs+=section['paragraphs']
  assert section['sourceIds'] and all(s in sources for s in section['sourceIds'])
 for evidence in article['evidence']:
  check_pair(evidence['title']);pairs += [evidence['reading'],evidence['limits']]
  assert evidence['sourceIds'] and all(s in sources for s in evidence['sourceIds'])
 for term in article['terms']:
  check_pair(term['term']);pairs.append(term['definition'])
 for pair in pairs:check_pair(pair)
 zh=sum(len(re.findall(r'[\u3400-\u9fff]',p['zh'])) for p in pairs)
 ja=sum(len(p['ja']) for p in pairs)
 assert zh>=600 and ja>=600,(event['id'],zh,ja)
 manifest[event['id']]={'zhCharacters':zh,'jaCharacters':ja,'minutes':max(3,math.ceil(max(zh/320,ja/500))+1),'reviewedAt':'2026-11-11'}
 (root/'public/readings'/f"{event['id']}.json").write_text(json.dumps(article,ensure_ascii=False,indent=2)+'\n')
old_events={e['id']:e for e in timeline['events']}
old_events.update({e['id']:e for e in events})
timeline['events']=sorted(old_events.values(),key=lambda e:(e['start'],e['id']))
source_map={s['id']:s for s in timeline['sources']}
source_map.update({s['id']:s for s in new_sources})
timeline['sources']=list(source_map.values());timeline['reviewedAt']='2026-11-11'
source_files={'tang-attire-figurine':'tang-sancai-woman.jpg','tang-attire-brocade':'tang-brocade-cuff.jpg'}
asset_map={a['id']:a for a in catalog['assets']}
right_map={a['id']:a for a in rights['assets']}
for filename,batch in zip(sys.argv[1:],batches):
 for asset in batch.get('assets',[]):
  path=Path(filename).parent/source_files[asset['id']]
  assert path.is_file()
  asset['src']=f"/images/{asset['id']}.jpg"
  dst=root/'public'/asset['src'].lstrip('/')
  shutil.copyfile(path,dst)
  asset_map[asset['id']]=asset
  right_map[asset['id']]={'id':asset['id'],'title':asset['title']['zh'],'titleJa':asset['title']['ja'],'dateTaken':asset['dateTaken'],'kind':'modern-photograph','depicts':asset['alt']['zh'],'filename':dst.name,'originalFileURL':asset['originalFileURL'],'sourcePage':asset['sourcePage'],'originalTitle':asset['sourcePage'].split('File:')[-1],'author':asset['author'],'license':asset['license'],'licenseURL':asset['licenseURL'],'attribution':asset['attribution'],'educationalCaption':asset['caption'],'alt':asset['alt'],'width':asset['width'],'height':asset['height'],'bytes':dst.stat().st_size,'sourceDate':asset['dateTaken'],'modifications':{'zh':'保留原始JPEG；卡片可能按版面裁切显示，正文可展开观察完整照片。','ja':'元のJPEGを保持。カードでは表示枠に合わせて切り取り、本文では写真全体を表示できる。'},'licenseEvidence':asset['sourcePage']+'#Licensing','verifiedAt':'2026-11-11','sha256':hashlib.sha256(dst.read_bytes()).hexdigest()}
catalog['assets']=list(asset_map.values());rights['assets']=list(right_map.values())
assert len(timeline['events'])==len(manifest)
for name,content in [('timeline.json',timeline),('catalog.json',catalog),('article-manifest.json',manifest),('image-rights.json',rights)]:
 (data/name).write_text(json.dumps(content,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'addedReadings':len(articles),'totalReadings':len(manifest),'newSources':len(new_sources),'totalImages':len(catalog['assets'])},ensure_ascii=False))
