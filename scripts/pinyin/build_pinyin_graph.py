import argparse
import json


MAX_WORDS_PER_EDGE = 10
MAX_CHARACTERS_PER_NODE = 10
MAX_EDGES_PER_NODE = 12


def set_default(obj):
    if isinstance(obj, set):
        return list(obj)
    raise TypeError


def parse_file(filename):
    with open(filename) as f:
        return json.load(f)


def get_level(index):
    if index < 1000:
        return 1
    if index < 2000:
        return 2
    if index < 4000:
        return 3
    if index < 7000:
        return 4
    if index < 10000:
        return 5
    return 6


def main():
    parser = argparse.ArgumentParser(description='Build a pinyin graph')
    parser.add_argument(
        '--word-list', help='a frequency-sorted wordlist that will be used with a dictionary to build a graph of pinyin sounds')
    parser.add_argument(
        '--full-dictionary', help='the full dictionary, output by dictionary.py, used to supply pinyin')
    args = parser.parse_args()

    word_list = parse_file(args.word_list)
    dictionary = parse_file(args.full_dictionary)

    graph = {}
    for index, word in enumerate(word_list):
        # the word_list is expected to have been generated from the dictionary, but be defensive
        if word not in dictionary:
            continue
        definitions = dictionary[word]
        if len(definitions) < 1:
            continue
        for definition in definitions:
            pinyin = definition['pinyin']
            syllables = pinyin.split(' ')
            if len(syllables) != len(word):
                # print(word)
                continue
            level = get_level(index)
            for i in range(0, len(syllables)):
                syllable = syllables[i]
                if syllable not in graph:
                    graph[syllable] = {
                        'node': {'level': level, 'chars': set()}, 'edges': {}
                    }
                graph[syllable]['node']['chars'].add(word[i])
                for j in range(i+1, len(syllables)):
                    connector_syllable = syllables[j]
                    if connector_syllable not in graph:
                        graph[connector_syllable] = {
                            'node': {'level': level, 'chars': set()}, 'edges': {}
                        }
                    if len(graph[connector_syllable]['node']['chars']) < MAX_CHARACTERS_PER_NODE:
                        graph[connector_syllable]['node']['chars'].add(
                            word[j])
                    if len(graph[syllable]['edges']) >= MAX_EDGES_PER_NODE:
                        continue
                    if connector_syllable not in graph[syllable]['edges']:
                        graph[syllable]['edges'][connector_syllable] = {
                            'level': level, 'words': set()}
                    if len(graph[syllable]['edges'][connector_syllable]['words']) < MAX_WORDS_PER_EDGE:
                        graph[syllable]['edges'][connector_syllable]['words'].add(
                            word)

    print(json.dumps(graph, ensure_ascii=False, default=set_default))


if __name__ == '__main__':
    main()
