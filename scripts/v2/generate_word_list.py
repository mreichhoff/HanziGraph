import argparse
import json
import re


def parse_file(filename):
    with open(filename) as f:
        return json.load(f)


def make_freq_dict(freq_list):
    return {word: index for index, word in enumerate(freq_list)}


def main():
    parser = argparse.ArgumentParser(
        description='Given frequency lists from different sources, plus a dictionary file, generate a wordlist in order of frequency.')
    parser.add_argument('-f', '--file-list', nargs='+',
                        help='The list of sorted frequency lists', required=True)
    parser.add_argument('-w', '--weights', nargs='+',
                        help='Weighting to apply to each frequency list, as some may be more important', required=True)
    parser.add_argument(
        '--dict', help='a dictionary file, output from dictionary.py')
    args = parser.parse_args()

    dictionary = parse_file(args.dict)
    frequency_lists = []

    if len(args.file_list) != len(args.weights):
        print('Each file must have an associated weight.')
        exit()

    for filename in args.file_list:
        with open(filename) as f:
            freq_list = json.load(f)
            frequency_lists.append(make_freq_dict(freq_list))

    average_ranks = {}
    add_to_end = []
    for word in dictionary:
        if len(word) == 1 and (re.match('[A-Za-z0-9]', word) != None):
            add_to_end.append(word)
            continue
        total = 0
        for index, frequency_list in enumerate(frequency_lists):
            weight = float(args.weights[index])
            if word in frequency_list:
                total += (frequency_list[word] * weight)
            else:
                total += (len(frequency_list) * weight)
        average_rank = total# / len(frequency_lists)
        average_ranks[word] = average_rank
    result = [item[0] for item in sorted(
        average_ranks.items(), key=lambda item: item[1])]
    for word in add_to_end:
        result.append(word)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
