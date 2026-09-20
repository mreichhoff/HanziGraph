"""Build lazy reading/kana dictionary supplements from the local JMdict dump.

Usage: python3 scripts/build-explorer-japanese.py
Existing classic dictionaries and graph vocabulary are left untouched.
"""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = root / 'raw/japanese/jmdict-eng-3.6.2.json'
target = root / 'public/data/japanese/lexicon'
target.mkdir(exist_ok=True)
data = json.loads(source.read_text())
entries = {}
kana_words = set()


def accepts(values, text):
    return '*' in values or text in values


for word in data['words']:
    for form in word['kanji'] + word['kana']:
        text = form['text']
        is_kana = 'appliesToKanji' in form
        if is_kana and word['kanji'] and not form['common'] and not any('uk' in sense['misc'] for sense in word['sense']):
            continue
        item = entries.setdefault(text, {'readings': [], 'definitions': []})
        readings = [form] if is_kana else [k for k in word['kana'] if accepts(k['appliesToKanji'], text)]
        for reading in sorted(readings, key=lambda k: not k['common']):
            if reading['text'] not in item['readings']:
                item['readings'].append(reading['text'])
        if is_kana:
            kana_words.add(text)
            for sense in word['sense']:
                if not accepts(sense['appliesToKana'], text):
                    continue
                gloss = '; '.join(g['text'] for g in sense['gloss'] if g['lang'] == 'eng')
                if gloss and gloss not in item['definitions']:
                    item['definitions'].append(gloss)

partitions = [{} for _ in range(100)]
for word, item in sorted(entries.items()):
    # Match JS charCodeAt partitioning, including supplementary-plane characters.
    encoded = word.encode('utf-16-le')
    part = sum(int.from_bytes(encoded[i:i+2], 'little') for i in range(0, len(encoded), 2)) % 100
    if not item['definitions']:
        del item['definitions']
    partitions[part][word] = item
for i, part in enumerate(partitions):
    (target / f'{i}.json').write_text(json.dumps(part, ensure_ascii=False, separators=(',', ':')) + '\n')
(target / 'kana.json').write_text(json.dumps(sorted(kana_words), ensure_ascii=False, separators=(',', ':')) + '\n')
print(f'{len(entries)} forms; {len(kana_words)} kana forms; {sum(p.stat().st_size for p in target.glob("*.json")):,} bytes')
