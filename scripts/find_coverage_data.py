import argparse
import json
from itertools import accumulate


def read_file(filename):
    with open(filename) as f:
        return json.load(f)


def get_frequencies(token_counts):
    freqs = {}
    total = 0
    for token, count in token_counts.items():
        freqs[token] = count
        total += count
    return (total, freqs)


def get_coverage(cumulative_percentages, full_list):
    result = {}
    steps = [(100, 1), (1000, 10), (1000000000, 100)]
    current_step = 0
    i = 0
    while i < len(cumulative_percentages):
        result[i] = cumulative_percentages[i]
        if i == steps[current_step][0]:
            current_step = current_step + 1
        i += steps[current_step][1]
    result[len(full_list)] = 1.0
    return result


def main():
    parser = argparse.ArgumentParser(
        description='Find the coverage if words or characters up to X are studied')
    parser.add_argument(
        '--character-freqs-filename', help='a filename with a dictionary of character to frequency count')
    parser.add_argument(
        '--word-freqs-filename', help='a filename with a dictionary of word to frequency count')
    parser.add_argument(
        '--full-wordlist-filename', help='a filename with an array of all words and characters')
    args = parser.parse_args()
    char_freq_list = read_file(args.character_freqs_filename)
    word_freq_list = read_file(args.word_freqs_filename)

    full_word_list = read_file(args.full_wordlist_filename)

    result = {}
    char_total, char_freqs = get_frequencies(char_freq_list)
    # TODO this step from when it was a list of (word, count) pairs, I think?
    # seems ripe for a refactor now
    char_percentages = [(value / char_total)
                        for value in sorted(char_freqs.values(), reverse=True)]

    word_total, word_freqs = get_frequencies(word_freq_list)
    word_percentages = [(value / word_total)
                        for value in sorted(word_freqs.values(), reverse=True)]
    char_cumulative_percentages = list(accumulate(char_percentages))
    word_cumulative_percentages = list(accumulate(word_percentages))

    result['chars'] = get_coverage(char_cumulative_percentages, [word for word in full_word_list if len(word) == 1])
    result['words'] = get_coverage(word_cumulative_percentages, full_word_list)

    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
