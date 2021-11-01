import argparse
import json


def main():
    parser = argparse.ArgumentParser(
        description='find single character words in a list')
    # TODO make HSK leveling thing optional
    parser.add_argument(
        '--word-list-filename', help='the filename of a list of words')
    args = parser.parse_args()

    result = []
    with open(args.word_list_filename) as f:
        for line in f:
            if len(line.strip()) == 1:
                result.append(line.strip())
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
