import argparse
import json


def read_file(filename):
    with open(filename) as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(
        description='Get frequency ranks for those words that are in a dictionary')
    parser.add_argument('--rank-filename',
                        help='a filename with a list of [word,count] pairs', required=True)
    parser.add_argument('--dictionary-filename',
                        help='a filename with a dictionary of words via parse_dictionary or similar', required=True)
    args = parser.parse_args()
    dictionary = read_file(args.dictionary_filename)
    freqs = read_file(args.rank_filename)
    result = []
    used = set()
    # for word, _ in freqs:
    for word in freqs:
        if word in dictionary:
            result.append(word)
            used.add(word)
    for word in dictionary.keys():
        if word not in used:
            result.append(word)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
