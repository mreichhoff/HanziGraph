"""Build explorer-only ranking, readings and kanji cards.
Requires wordfreq==3.1.1; inputs in raw/japanese (JMdict JSON + kanjidic2.xml.gz).
No tokenization/phrase-frequency estimates: only direct wordfreq vocabulary matches.
"""
import gzip
import json
import re
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path
from wordfreq import get_frequency_dict

root = Path(__file__).resolve().parents[1]
public = root / 'public/data/japanese'
raw = root / 'raw/japanese'
load = lambda path: json.loads(path.read_text())
source = load(raw / 'jmdict-eng-3.6.2.json')
words = load(public / 'wordlist.json')
base = load(public / 'definitions.json')
freq = get_frequency_dict('ja', wordlist='large')
bad_tags = {'rK', 'oK', 'sK', 'iK'}
forms = {}
readings = defaultdict(dict)
for entry in source['words']:
    for form in entry['kanji'] + entry['kana']:
        text = form['text']
        info = forms.setdefault(text, {'common': False, 'modern': False, 'kana': False})
        info['common'] |= form['common']
        info['modern'] |= not bool(bad_tags.intersection(form['tags']))
        info['kana'] |= any('uk' in sense['misc'] for sense in entry['sense'])
        choices = [form] if 'appliesToKanji' in form else [k for k in entry['kana'] if '*' in k['appliesToKanji'] or text in k['appliesToKanji']]
        for k in choices:
            priority = (not k['common'], bool(set(k['tags']) & {'ok', 'rk', 'sk', 'ik'}))
            readings[text][k['text']] = min(readings[text].get(k['text'], (True, True)), priority)


def rank(word):
    info = forms.get(word, {})
    # Keep unusual spellings available, but behind ordinary modern vocabulary.
    return (not info.get('modern', True), -(freq.get(word, 0) or (1e-6 if info.get('common') else 0)), not info.get('common', False), len(word), word)


ordered = sorted(words, key=rank)
excluded = [w for w in words if not forms.get(w, {}).get('modern', True) or len(w) > 6]
index = {
    'readings': {w: sorted(readings[w], key=lambda r: (*readings[w][r], r)) for w in base if readings[w]},
    'searchOrder': sorted(base, key=rank),
    'excludedEdges': sorted(excluded),
    'usuallyKana': [w for w in base if forms.get(w, {}).get('kana')],
}
kanji = {}
xml = ET.fromstring(gzip.decompress((raw / 'kanjidic2.xml.gz').read_bytes()))
for c in xml.findall('character'):
    literal = c.findtext('literal')
    groups = c.findall('reading_meaning/rmgroup')
    kanji[literal] = {
        'on': [r.text for group in groups for r in group.findall('reading') if r.get('r_type') == 'ja_on'],
        'kun': [r.text for group in groups for r in group.findall('reading') if r.get('r_type') == 'ja_kun'],
        'meanings': [m.text for group in groups for m in group.findall('meaning') if not m.get('m_lang')],
        'strokes': int(c.findtext('misc/stroke_count') or 0),
        'grade': int(c.findtext('misc/grade') or 0),
        'rank': int(c.findtext('misc/freq') or 0),
        'words': [],
    }
# Prefer useful single-kanji vocabulary with kana, then a few common compounds.
excluded = set(excluded)
for word in ordered:
    if word not in base or word in excluded:
        continue
    chars = list(dict.fromkeys(c for c in word if c in kanji))
    if len(chars) == 1 and len(word) > 1 and word != chars[0]:
        target = kanji[chars[0]]['words']
        if len(target) < 8:
            target.append(word)
for char, value in kanji.items():
    if not value['words']:
        del value['words']

def write(name, value):
    (public / name).write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n')

# Edge labels are best-effort English, so only words that can label an edge between two
# ranked kanji are kept, and only down to the depth a reader realistically explores.
label_words = set()
edge_rank = {w: i for i, w in enumerate(ordered)}
for word in ordered[:40000]:
    chars = [c for c in dict.fromkeys(word) if c in kanji and kanji[c]['rank']]
    if len(chars) >= 2:
        label_words.add(word)
edge_glosses = {}
for entry in source['words']:
    for form in entry['kanji']:
        text = form['text']
        if text in label_words and text not in edge_glosses:
            # Senses are ordered by prominence, so take the first gloss that is short
            # enough for an edge rather than the first one overall: many entries lead
            # with their most verbose wording and carry a usable one a line later.
            for sense in entry['sense']:
                for raw in sense['gloss']:
                    if raw['lang'] != 'eng':
                        continue
                    gloss = re.sub(r'\s*\([^)]*\)', '', raw['text']).strip().rstrip(',;.').split(';')[0].strip()
                    if gloss and len(gloss) <= 24:
                        edge_glosses[text] = gloss
                        break
                if text in edge_glosses:
                    break
write('explorer-glosses.json', edge_glosses)
write('explorer-word-order.json', ordered)
write('explorer-index.json', index)
write('kanji.json', kanji)
write('explorer-character-ranks.json', {char: value['rank'] for char, value in kanji.items() if value['rank']})
print(f'{len(edge_glosses)} edge glosses; {len(ordered)} searchable graph words; {len(excluded)} spellings/long expressions excluded from automatic edges; {len(kanji)} kanji cards')
print('Top search entries:', index['searchOrder'][:12])
print('学校 readings:', index['readings'].get('学校'))
print('学 vocabulary:', kanji['学'].get('words'))
