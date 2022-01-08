import json
import argparse


class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)


def parse_line(line):
    # example: 上网（三级
    # TODO make more generic
    return line.strip().split('\t')


def get_words_with_level(lines):
    result = {}
    for line in lines:
        parsed_line = parse_line(line)
        result[parsed_line[0]] = int(parsed_line[1])
    return result


def get_graph(words_with_level):
    # generate nodes at the character level with an associated minimum hsk level field
    graph = {}
    # TODO single character word bug
    for key, value in words_with_level.items():
        for i in range(0, len(key)):
            if key[i] not in graph:
                graph[key[i]] = {'node': {'level': value}, 'edges': {}}
            for j in range(0, len(key)):
                if j != i:
                    if key[j] not in graph[key[i]]['edges']:
                        graph[key[i]]['edges'][key[j]] = {
                            'level': 6, 'words': set()}
                    graph[key[i]]['edges'][key[j]]['level'] = min(
                        graph[key[i]]['edges'][key[j]]['level'], value)
                    graph[key[i]]['edges'][key[j]]['words'].add(key)
            graph[key[i]]['node']['level'] = min(
                graph[key[i]]['node']['level'], value)

    return graph


def convert_to_cytoscape(graph):
    # TODO not currently used
    # TODO modify to handle words being part of entries
    result = {'nodes': [], 'edges': []}
    for key, value in graph.items():
        min_level = 6
        for target, level in value.items():
            min_level = min(min_level, level)
            result['edges'].append(
                {'data': {'id': key+target, 'source': key, 'target': target, 'level': level}})
        result['nodes'].append({'data': {'id': key, 'level': min_level}})
    return result


def main():
    parser = argparse.ArgumentParser(
        description='Build a graph of hanzi word-forming relationships')
    # TODO make HSK leveling thing optional
    parser.add_argument(
        '--hanzi-list-filename', help='the filename of a list of hanzi with HSK levels')
    args = parser.parse_args()
    words_with_level = {}
    with open(args.hanzi_list_filename) as f:
        words_with_level = get_words_with_level(f.readlines())
        graph = get_graph(words_with_level)
        # can add cytoscape conversion here, or do it on the frontend
        print(json.dumps(graph, ensure_ascii=False, cls=SetEncoder))


if __name__ == '__main__':
    main()
