#!/usr/bin/env python3
"""Validate bilingual reading batches and publish per-event static JSON.

Usage: python scripts/import-readings.py /absolute/batch-directory [--partial]
The partial mode is only for local drafting. Release imports require all events.
"""
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INPUT = Path(sys.argv[1])
PARTIAL = '--partial' in sys.argv
REVIEW_DATE = '2026-11-10'
timeline = json.loads((ROOT / 'app/data/timeline.json').read_text())
catalog = json.loads((ROOT / 'app/data/catalog.json').read_text())
events = {event['id']: event for event in timeline['events']}
sources = {source['id']: source for source in catalog['sources'] + timeline['sources']}
articles = {}
added_sources = {}


def check_pair(value, path):
    assert isinstance(value, dict), f'{path}: must be a bilingual object'
    for language in ['zh', 'ja']:
        assert isinstance(value.get(language), str) and value[language].strip(), f'{path}: missing {language}'
        assert not re.search(r'TODO|PLACEHOLDER|待补充|翻訳準備中', value[language]), f'{path}: placeholder'


def body_parts(article, language):
    parts = [article['thesis'][language]]
    parts += [paragraph[language] for section in article['sections'] for paragraph in section['paragraphs']]
    parts += [item[field][language] for item in article['evidence'] for field in ['reading', 'limits']]
    parts += [article['discussion']['body'][language]]
    parts += [term['definition'][language] for term in article['terms']]
    return ''.join(parts)


for batch in sorted(INPUT.glob('*-articles.json')):
    data = json.loads(batch.read_text())
    for source in data.get('sources', []):
        sid = source['id']
        for key in ['title', 'kind', 'claim']:
            check_pair(source[key], f'{sid}/{key}')
        assert source['url'].startswith('https://'), f'{sid}: invalid source URL'
        if sid in sources:
            assert sources[sid] == source, f'Conflicting source ID: {sid}'
        else:
            sources[sid] = source
            added_sources[sid] = source
    for eid, article in data['articles'].items():
        assert eid in events, f'Unknown event: {eid}'
        assert eid not in articles, f'Duplicate article: {eid}'
        articles[eid] = article

missing = sorted(set(events) - set(articles))
assert PARTIAL or not missing, f'{len(missing)} readings missing: {missing}'
manifest = {}
all_counts = []
for eid, article in articles.items():
    check_pair(article['thesis'], f'{eid}/thesis')
    assert len(article['sections']) >= 3, f'{eid}: needs at least 3 developed sections'
    section_ids = set()
    references = set(events[eid]['sourceIds'])
    for section in article['sections']:
        assert re.fullmatch(r'[a-z0-9-]+', section['id']), f'{eid}: invalid section ID'
        assert section['id'] not in section_ids, f'{eid}: duplicate section ID'
        section_ids.add(section['id'])
        check_pair(section['title'], f'{eid}/{section["id"]}/title')
        assert section['paragraphs'], f'{eid}: section has no paragraphs'
        for paragraph in section['paragraphs']:
            check_pair(paragraph, f'{eid}/{section["id"]}/paragraph')
        assert section['sourceIds'], f'{eid}/{section["id"]}: needs references'
        references.update(section['sourceIds'])
    assert article['evidence'], f'{eid}: needs evidence reading'
    for item in article['evidence']:
        for field in ['title', 'reading', 'limits']:
            check_pair(item[field], f'{eid}/evidence/{field}')
        assert item['sourceIds'], f'{eid}: evidence needs references'
        references.update(item['sourceIds'])
    for field in ['title', 'body']:
        check_pair(article['discussion'][field], f'{eid}/discussion/{field}')
    assert article['terms'], f'{eid}: needs defined concepts'
    for term in article['terms']:
        check_pair(term['term'], f'{eid}/term')
        check_pair(term['definition'], f'{eid}/definition')
    assert references <= set(sources), f'{eid}: missing references {references - set(sources)}'
    zh = body_parts(article, 'zh')
    ja = body_parts(article, 'ja')
    count = len(re.findall(r'[\u3400-\u9fff]', zh))
    assert count >= 500, f'{eid}: only {count} Chinese characters in developed text'
    assert len(ja) >= 550, f'{eid}: Japanese version is unexpectedly short'
    all_counts.append(count)
    manifest[eid] = {
        'zhCharacters': count,
        'jaCharacters': len(ja),
        'minutes': max(3, math.ceil(max(count / 320, len(ja) / 500)) + 1),
        'reviewedAt': REVIEW_DATE,
    }

target = ROOT / 'public/readings'
target.mkdir(exist_ok=True)
for eid, article in articles.items():
    (target / f'{eid}.json').write_text(json.dumps(article, ensure_ascii=False, separators=(',', ':')) + '\n')
(ROOT / 'app/data/article-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
(ROOT / 'app/data/article-sources.json').write_text(json.dumps(list(added_sources.values()), ensure_ascii=False, indent=2) + '\n')
print(json.dumps({
    'articles': len(articles), 'missing': len(missing),
    'newSources': len(added_sources),
    'ChineseCharacters': sum(all_counts),
    'minimumCharacters': min(all_counts) if all_counts else 0,
    'maximumCharacters': max(all_counts) if all_counts else 0,
    'averageCharacters': round(sum(all_counts) / len(all_counts)) if all_counts else 0,
}, ensure_ascii=False))
