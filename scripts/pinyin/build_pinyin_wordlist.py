import argparse
import json


def parse_file(filename):
    with open(filename) as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(
        description='Build the full list of syllables in Chinese, in order they appear in a frequency list. Similar to build_pinyin_graph.py')
    parser.add_argument(
        '--word-list', help='a frequency-sorted wordlist that will be used with a dictionary to build the list of pinyin sounds')
    parser.add_argument(
        '--full-dictionary', help='the full dictionary, output by dictionary.py, used to supply pinyin')
    args = parser.parse_args()

    word_list = parse_file(args.word_list)
    dictionary = parse_file(args.full_dictionary)

    # retain ordering for the final result, but use a set to de-duplicate (could use contains checks, but the list is actually kinda long)
    result = []
    seen_pronunciations = set()
    for word in word_list:
        if word not in dictionary:
            continue
        definitions = dictionary[word]
        if len(definitions) < 1:
            continue
        for definition in definitions:
            syllables = definition['pinyin'].split(' ')
            if len(syllables) != len(word):
                # print(word)
                # defensive check for a small number of pinyin that include unexpected dashes
                # TODO get a better fix
                continue
            pinyin = definition['pinyin'].replace(' ', '').lower()
            if pinyin in seen_pronunciations:
                continue
            seen_pronunciations.add(pinyin)
            result.append(pinyin)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
