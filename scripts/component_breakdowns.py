import argparse
import json
from hanzidentifier import is_simplified


def set_default(obj):
    if isinstance(obj, set):
        return list(obj)
    raise TypeError


direction_characters_i_cant_incorporate_yet = [
    '⿰', '⿱', '⿲', '⿳', '⿴', '⿵', '⿶', '⿷', '⿸', '⿹', '⿺', '⿻']


def strip_directionality(line):
    return line.translate({ord(c): None for c in direction_characters_i_cant_incorporate_yet})


def get_character_set(filenames):
    result = set()
    for filename in filenames:
        with open(filename) as f:
            hanzi_keys = json.load(f)
            result = result.union(hanzi_keys.keys())
    return result


def build_graph(breakdown_filename, allowlist):
    result = {}
    with open(breakdown_filename) as f:
        for line in f:
            fields = line.strip().split('\t')
            # just kinda assuming it'll be parseable this way, for now...
            root = fields[1]
            if root not in allowlist:
                continue
            if root not in result:
                result[root] = {'type': 's' if is_simplified(
                    root) else 't', 'components': set(), 'componentOf': set()}
            breakdown = strip_directionality(fields[2]).split('[')[0]
            for item in breakdown:
                if item == root:
                    continue
                result[root]['components'].add(item)
                if item not in result:
                    result[item] = {'type': 's' if is_simplified(
                        item) else 't', 'components': set(), 'componentOf': set()}
                result[item]['componentOf'].add(root)
    return result


def main():
    parser = argparse.ArgumentParser(
        description='Get character breakdowns based on unicode components.')
    parser.add_argument(
        '--breakdown-filename', help='the filename that contains breakdowns of characters')
    parser.add_argument('-f', '--file-list', nargs='+',
                        help='The list of files to process', required=True)

    args = parser.parse_args()
    interesting_hanzi = get_character_set(args.file_list)
    graph = build_graph(args.breakdown_filename, interesting_hanzi)
    print(json.dumps(graph, ensure_ascii=False, default=set_default))


if __name__ == '__main__':
    main()
