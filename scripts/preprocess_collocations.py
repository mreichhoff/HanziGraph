import argparse
import json

from lang_utils import tokenize, should_block, join


def get_words(filename, max_rank):
    with open(filename) as f:
        words = json.load(f)
        return {key: {} for key, value in words.items() if value['freq'] <= max_rank}


def get_blocklist(filename):
    with open(filename) as f:
        return [x.strip() for x in f]


def trim(words, max):
    result = {}
    for key, ngrams in words.items():
        sorted_ngrams = sorted(
            ngrams.items(), key=lambda kvp: kvp[1], reverse=True)
        result[key] = {key: value for key, value in sorted_ngrams[0:max]}
    return result


def main():
    parser = argparse.ArgumentParser(
        description='get collocations for a set of words')
    parser.add_argument(
        '--filename', help='the filename of the list of sentences in the target language')
    parser.add_argument(
        '--words-file', help='the output of process_dataset that will supply the list of words')
    parser.add_argument(
        '--n', help='the desired length of each collocation (e.g., 3 for trigrams)')
    parser.add_argument(
        '--max-freq-rank', help='get collocations for words up to this frequency rank')
    parser.add_argument('--blocklist-filename',
                        help='a filename with vulgar or offensive words that should be excluded')
    args = parser.parse_args()

    words = get_words(args.words_file, int(args.max_freq_rank))
    blocklist = get_blocklist(args.blocklist_filename)
    n = int(args.n)
    ngrams = {}

    with open(args.filename) as f:
        for line in f:
            if should_block(line.strip(), blocklist):
                continue
            tokens = tokenize(
                line.strip(), 'chinese', True)
            for i in range(len(tokens) - (n-1)):
                current_ngram = []
                for j in range(n):
                    if tokens[i+j] not in words:
                        continue
                    current_ngram.append(tokens[i+j])
                if len(current_ngram) != n:
                    continue
                ngram_joined = join(current_ngram, 'chinese')
                if ngram_joined not in ngrams:
                    ngrams[ngram_joined] = 0
                ngrams[ngram_joined] = ngrams[ngram_joined]+1

    for key, value in ngrams.items():
        print(f"{key}\t{value}")


if __name__ == '__main__':
    main()
