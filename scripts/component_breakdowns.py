import argparse
import json
from hanzidentifier import is_simplified
from hanzidentifier import is_traditional


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


def has_no_glyph(item):
    return (item.isnumeric()) or (u'\u31d0' <= item <= u'\u31e3') or (U'\U000239B1' <= item <= U'\U000239C1') or (U'\U00022033' <= item <= U'\U00022044') or (U'\U0002007C' <= item <= '\U00020085') or (U'\U0002D4DF' <= item <= U'\U0002D543') or (U'\U00020B90' <= item <= U'\U00020B9E')


def build_ids_graph(breakdown_filename, allowlist):
    result = {}
    with open(breakdown_filename) as f:
        for line in f:
            fields = line.strip().split('\t')
            root = fields[1]
            if root not in allowlist or root in result:
                continue
            if root not in result:
                result[root] = {'type': 's' if is_simplified(
                    root) else 't', 'components': set(), 'componentOf': set()}
            breakdown = strip_directionality(fields[2]).split('[')[0]
            for item in breakdown:
                if item == root or has_no_glyph(item):
                    continue
                result[root]['components'].add(item)
                if item not in result:
                    result[item] = {'type': 's' if is_simplified(
                        item) else 't', 'components': set(), 'componentOf': set()}
                result[item]['componentOf'].add(root)
    return result


def build_decomp_graph(breakdown_filename, allowlist, result):
    with open(breakdown_filename) as f:
        for line in f:
            # just kinda assuming it'll be parseable this way, for now...
            root, data = line.strip().split(':')
            if root not in allowlist or (root in result and len(result[root]['components']) > 0):
                continue
            if root not in result:
                result[root] = {'type': 's' if is_simplified(
                    root) else 't', 'components': set(), 'componentOf': set()}
            breakdown = data.rstrip(')').split('(')[1].split(',')
            for item in breakdown:
                if item == root or has_no_glyph(item):
                    continue
                result[root]['components'].add(item)
                if item not in result:
                    result[item] = {'type': 's' if is_simplified(
                        item) else 't', 'components': set(), 'componentOf': set()}
                result[item]['componentOf'].add(root)


def main():
    parser = argparse.ArgumentParser(
        description='Get character breakdowns based on unicode components.')
    parser.add_argument(
        '--breakdown-filename', help='the filename that contains the IDS breakdowns of characters')
    parser.add_argument(
        '--decomp-filename', help='the filename that contains the cjkv decomp of characters')
    parser.add_argument('-f', '--file-list', nargs='+',
                        help='The list of files to process', required=True)

    args = parser.parse_args()
    interesting_hanzi = get_character_set(args.file_list)
    graph = build_ids_graph(args.breakdown_filename, interesting_hanzi)
    build_decomp_graph(args.decomp_filename, interesting_hanzi, graph)
    print(json.dumps(graph, ensure_ascii=False, default=set_default))


if __name__ == '__main__':
    main()
