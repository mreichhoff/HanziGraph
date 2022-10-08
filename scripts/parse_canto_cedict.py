import argparse
import json
from dictionary import get_dictionary_entries


def parse_extended_cedict_line(line):
    line = line.rstrip('/').split('/')
    english = ''
    if len(line) > 1:
        english = ', '.join(line[1:]).strip().rstrip(',')
    char, pinyin = line[0].split('[')
    jyutping = pinyin.split('{')
    traditional, _ = char.split()

    return (traditional, english, jyutping[1].rstrip().rstrip('}'))


def get_extended_dictionary_entries(dict_filename):
    result = {}
    with open(dict_filename) as f:
        for line in f:
            if not line.startswith('#') and len(line) > 0:
                entry = parse_extended_cedict_line(line)
                if entry[0] not in result:
                    result[entry[0]] = []
                # use pinyin as key just to match the interface of others
                result[entry[0]].append({'en': entry[1], 'pinyin': entry[2]})
    return result


def main():
    parser = argparse.ArgumentParser(
        description='Get definitions for words. Outputs JSON.')
    parser.add_argument(
        '--dict-filename', help='the dictionary filename, currently compatible with cedict')
    parser.add_argument(
        '--transcriptions-filename', help='the cantonese readings, which will be substituted for pinyin in the default cedict')
    parser.add_argument(
        '--extension-filename', help='the cantonese overrides, substituted for the mandarin definitions')

    args = parser.parse_args()

    transcript_result = get_extended_dictionary_entries(
        args.transcriptions_filename)
    extension_result = get_extended_dictionary_entries(
        args.extension_filename)
    standard_result = get_dictionary_entries(
        args.dict_filename, 'traditional', None)
    result = {}
    for key, value in standard_result.items():
        if key not in transcript_result:
            continue
        transcript_defs = transcript_result[key]
        definition_result = []
        for i in range(len(transcript_defs)):
            if i < len(value):
                definition_result.append(
                    {'en': value[i]['en'], 'pinyin': transcript_defs[i]['pinyin']})
        result[key] = definition_result
    # TODO: maybe just append? What if there's multiple?
    # whatever, for now just substitute
    for key, value in extension_result.items():
        result[key] = value

    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
