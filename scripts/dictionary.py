import json
import argparse


def parse_cedict_line(line, character_type):
    line = line.rstrip('/').split('/')
    english = line[1:]
    char, pinyin = line[0].split('[')
    traditional, simplified = char.split()

    return (simplified if character_type == 'simplified' else traditional, english, pinyin.rstrip().rstrip(']'))


def parse_classifier(cedict_classifier, character_type):
    # I...can I do this?
    no_cl = cedict_classifier.split('CL:')[1]
    classifiers_and_pinyin = no_cl.split(',')
    # oh no
    no_pinyin = [x.split('[')[0] for x in classifiers_and_pinyin]
    result = []
    for character in no_pinyin:
        # oh not again
        maybe_trad_and_simplified = character.split('|')
        if len(maybe_trad_and_simplified) > 1:
            result.append(maybe_trad_and_simplified[1] if character_type == 'simplified' else maybe_trad_and_simplified[0])
        else:
            result.append(maybe_trad_and_simplified[0])
    return result

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


def get_dictionary_entries(dict_filename, character_type, filter_set):
    result = {}
    with open(dict_filename) as f:
        for line in f:
            if not line.startswith('#') and len(line) > 0 and len(line.rstrip('/').split('/')) > 1:
                entry = parse_cedict_line(line.strip(), character_type)
                if (not filter_set) or (entry[0] in filter_set):
                    if entry[0] not in result:
                        result[entry[0]] = []
                    for definition in entry[1]:
                        if definition.startswith('CL:') and len(result[entry[0]]) > 0:
                            result[entry[0]][len(result[entry[0]])-1]['measure'] = parse_classifier(definition, character_type)
                            continue
                        if definition.startswith('variant of ') and entry[0] in definition:
                            continue
                        result[entry[0]].append(
                            {'en': definition, 'pinyin': entry[2]})
    return result


def main():
    parser = argparse.ArgumentParser(
        description='Get definitions for words. Outputs JSON.')
    parser.add_argument(
        '--allowlist-filename', help='the filename of an allowlist, one word per line')
    parser.add_argument(
        '--dict-filename', help='the dictionary filename, currently compatible with cedict')
    parser.add_argument(
        '--character-type', help='simplified or traditional characters')

    args = parser.parse_args()

    result = get_dictionary_entries(
        args.dict_filename, args.character_type, (get_allowlist(args.allowlist_filename) if args.allowlist_filename else None))
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
