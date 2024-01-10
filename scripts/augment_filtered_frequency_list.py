import argparse
import json
import hanzidentifier


def read_file(filename):
    with open(filename) as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(
        description='Get frequency ranks for those words that are in a dictionary')
    parser.add_argument('--rank-filename',
                        help='a filename with a list of [word,count] pairs', required=True)
    parser.add_argument('--examples-filename',
                        help='a filename with examples from, e.g., examples.py', required=True)
    parser.add_argument('--character-set',
                        help='simplified vs traditional', required=True)
    args = parser.parse_args()
    freqs = read_file(args.rank_filename)
    sentences = read_file(args.examples_filename)
    filter_function = hanzidentifier.is_simplified if args.character_set == 'simplified' else hanzidentifier.is_traditional
    seen = set()
    for word in freqs:
        seen.add(word)
    for sentence in sentences:
        for word in sentence['zh']:
            if word not in seen and filter_function(word):
                freqs.append(word)
                seen.add(word)
    print(json.dumps(freqs, ensure_ascii=False))


if __name__ == '__main__':
    main()
