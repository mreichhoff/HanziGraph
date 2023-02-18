import argparse
import json


def read_file(filename):
    with open(filename) as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(
        description='Get dictionary entries for those words that appear in a set of sentences or in the top N of a frequency list')
    parser.add_argument('--examples-filename',
                        help='a filename with examples from, e.g., examples.py', required=True)
    parser.add_argument('--freq-filename',
                        help='a filename with frequencies', required=True)
    parser.add_argument('--max-rank',
                        help='the rank above which words will not be included', required=True)
    parser.add_argument('--dictionary-filename',
                        help='a filename with a dictionary of words via parse_dictionary or similar', required=True)
    parser.add_argument(
        '--output-unused-only', help='output only those that aren\'t included', action=argparse.BooleanOptionalAction)
    args = parser.parse_args()
    dictionary = read_file(args.dictionary_filename)
    sentences = read_file(args.examples_filename)
    freqs = read_file(args.freq_filename)
    max_rank = int(args.max_rank)
    result = {}
    for sentence in sentences:
        for word in sentence['zh']:
            if word in dictionary and word not in result:
                result[word] = dictionary[word]
    for i in range(max_rank):
        if freqs[i] in dictionary and word not in result:
            result[freqs[i]] = dictionary[freqs[i]]
    if not args.output_unused_only:
        print(json.dumps(result, ensure_ascii=False))
    else:
        for word in result.keys():
            del dictionary[word]
        print(json.dumps(dictionary, ensure_ascii=False))


if __name__ == '__main__':
    main()
