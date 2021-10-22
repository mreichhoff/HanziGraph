import json
import argparse


def get_word_frequencies(filename):
    with open(filename) as f:
        return {value.strip(): idx for idx, value in enumerate(f)}


def main():
    parser = argparse.ArgumentParser(
        description='Get a word frequency map as json')
    parser.add_argument(
        '--frequency-list-filename', help='the filename of a frequency list, one word per line')
    args = parser.parse_args()
    print(json.dumps(get_word_frequencies(
        args.frequency_list_filename), ensure_ascii=False))


if __name__ == '__main__':
    main()
