import argparse
import json
from heapq import nlargest

def parse_file(filename):
    with open(filename) as f:
        return json.load(f)

def main():
    parser = argparse.ArgumentParser(
        description='Given a word frequency dictionary, output an array of words ranked by frequency, optionally up to some max rank.')
    parser.add_argument(
        '--freqs-filename', help='A file with a JSON dictionary of word to number of times it was observed.')
    parser.add_argument(
        '--limit', help='Optional. Remove words ranked lower than this limit.')
    args = parser.parse_args()
    raw_result = parse_file(args.freqs_filename)
    limit = len(raw_result)
    if args.limit:
        limit = min(int(args.limit), len(raw_result))
    limited = nlargest(limit, raw_result.items(), key=lambda kvp: kvp[1])
    result = [item[0] for item in limited]
    print(json.dumps(result, ensure_ascii=False))

if __name__ == '__main__':
    main()
