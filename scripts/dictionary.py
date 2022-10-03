import json
import argparse


def parse_cedict_line(line):
    line = line.rstrip('/').split('/')
    english = ', '.join(line[1:]).strip().rstrip(',')
    char, pinyin = line[0].split('[')
    _, simplified = char.split()

    return (simplified, english, pinyin.rstrip().rstrip(']'))


# TODO should make this more generic...it's basically just a filter
def get_allowlist(allowlist_filename):
    allowlist = set()
    with open(allowlist_filename) as f:
        for line in f:
            word = line.strip()
            allowlist.add(word)
            # we want each word and each individual character
            for i in range(0, len(word)):
                allowlist.add(word[i])
    return allowlist


def get_dictionary_entries(dict_filename, filter_set):
    result = {}
    with open(dict_filename) as f:
        for line in f:
            if not line.startswith('#') and len(line) > 0 and len(line.rstrip('/').split('/')) > 1:
                entry = parse_cedict_line(line)
                if (not filter_set) or (entry[0] in filter_set):
                    if entry[0] not in result:
                        result[entry[0]] = []
                    result[entry[0]].append(
                        {'en': entry[1], 'pinyin': entry[2]})
    return result


def main():
    parser = argparse.ArgumentParser(
        description='Get definitions for words. Outputs JSON.')
    parser.add_argument(
        '--allowlist-filename', help='the filename of an allowlist, one word per line')
    parser.add_argument(
        '--dict-filename', help='the dictionary filename, currently compatible with cedict')

    args = parser.parse_args()

    result = get_dictionary_entries(
        args.dict_filename, (get_allowlist(args.allowlist_filename) if args.allowlist_filename else None))
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
