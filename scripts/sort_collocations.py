import argparse
import json
from heapq import heappush, heappushpop


def main():
    parser = argparse.ArgumentParser(
        description='given preprocessed collocations and counts, output the most frequent ones for each word')
    parser.add_argument(
        '--filename', help='the filename of the precalculated collocation counts')
    parser.add_argument(
        '--max', help='the max number of ngrams per word')
    args = parser.parse_args()

    word_set = {}
    with open(args.filename) as f:
        for line in f:
            key, value = line.strip().split('\t')
            value = int(value)
            for word in key.split(' '):
                if word not in word_set:
                    word_set[word] = []
                if len(word_set[word]) < int(args.max):
                    heappush(word_set[word], (value, key))
                else:
                    heappushpop(word_set[word], (value, key))
    print(json.dumps({key: {x[1]: x[0] for x in value}
          for key, value in word_set.items()}, ensure_ascii=False))


if __name__ == '__main__':
    main()
