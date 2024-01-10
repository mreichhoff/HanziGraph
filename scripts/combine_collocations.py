import argparse
import json


def read_file(filename):
    with open(filename) as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(
        description='Combine collocations of varying lengths into a single file')
    parser.add_argument('-f', '--file-list', nargs='+',
                        help='The list of files to process', required=True)
    args = parser.parse_args()
    all_collocations = [read_file(filename) for filename in args.file_list]
    result = {}
    for collocation_file in all_collocations:
        for key, collocations in collocation_file.items():
            if key not in result:
                result[key] = {}
            result[key] |= collocations
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
