import json
import argparse


class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)


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


def get_graph(filename, dictionary):
    MAX_EDGES = 8
    MAX_WORDS_PER_EDGE = 3
    # generate nodes at the character level with an associated minimum hsk level field
    graph = {}
    # TODO single character word bug
    with open(filename) as f:
        index = 0
        for line in f:
            key = line.strip()
            if key not in dictionary:
                continue
            for i in range(0, len(key)):
                if key[i] not in dictionary:
                    continue
                if key[i] not in graph:
                    graph[key[i]] = {
                        'node': {'level': get_level(index)}, 'edges': {}}
                if len(graph[key[i]]['edges']) == MAX_EDGES:
                    continue
                for j in range(0, len(key)):
                    if j != i:
                        if len(graph[key[i]]['edges']) == MAX_EDGES:
                            continue
                        if key[j] not in dictionary:
                            continue
                        if key[j] not in graph[key[i]]['edges']:
                            graph[key[i]]['edges'][key[j]] = {
                                'level': 6, 'words': []}
                        graph[key[i]]['edges'][key[j]]['level'] = min(
                            graph[key[i]]['edges'][key[j]]['level'], get_level(index))
                        if len(graph[key[i]]['edges'][key[j]]['words']) < MAX_WORDS_PER_EDGE:
                            graph[key[i]]['edges'][key[j]]['words'].append(key)
                graph[key[i]]['node']['level'] = min(
                    graph[key[i]]['node']['level'], get_level(index))
            index = index+1

    return graph


def parse_allowlist(filename):
    with open(filename) as f:
        result = json.load(f)
        if type(result) is list:
            result = set(result)
        if type(result) is dict:
            result = set(result.keys())
        return result


def parse_dictionary(filename):
    with open(filename) as f:
        return set(json.load(f).keys())


def main():
    parser = argparse.ArgumentParser(
        description='Build a graph of hanzi word-forming relationships')
    # TODO make HSK leveling thing optional
    parser.add_argument(
        '--hanzi-list-filename', help='the filename of a list of hanzi with HSK levels')
    parser.add_argument(
        '--allowlist-filename', help='the filename of a list of hanzi allowed')
    parser.add_argument(
        '--augment-filename', help='the filename of the output of dictionary.py that can find words with characters in allowlist')
    args = parser.parse_args()

    allowlist = parse_allowlist(args.allowlist_filename)
    graph = get_graph(args.hanzi_list_filename, allowlist)
    if args.augment_filename:
        all_words = parse_dictionary(args.augment_filename)
        target_characters = allowlist - set(graph.keys())
        for word in all_words:
            # TODO: duplication
            for character in word:
                if character in target_characters:
                    if character not in graph:
                        graph[character] = {
                            'node': {'level': 6}, 'edges': {}}
                    if len(graph[character]['edges']) == 5:
                        continue
                    for j in range(0, len(word)):
                        if word[j] != character:
                            if len(graph[character]['edges']) == 5:
                                continue
                            if word[j] not in graph[character]['edges']:
                                graph[character]['edges'][word[j]] = {
                                    'level': 6, 'words': []}
                            if len(graph[character]['edges'][word[j]]['words']) < 3:
                                graph[character]['edges'][word[j]
                                                          ]['words'].append(word)

    print(json.dumps(graph, ensure_ascii=False))


if __name__ == '__main__':
    main()
