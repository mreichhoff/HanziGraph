import json
import argparse


def read_file(filename):
    with open(filename) as f:
        return json.load(f)


def clean(examples):
    result = []
    seen = set()
    for example in examples:
        chinese_length = len(example[0])
        english_length = len(example[1])
        if(abs(english_length - chinese_length) < 6 and ((chinese_length / english_length) < 2) and ((english_length / chinese_length)) < 2) and (''.join(example[0])) not in seen:
            result.append({'zh': example[0], 'en': ' '.join(example[1])})
            seen.add(''.join(example[0]))
    return result


def main():
    parser = argparse.ArgumentParser(
        description='Given processed datasets for the lower-quality datasets, with high-quality example coverage filtered, output examples from all datasets')
    parser.add_argument('-f', '--file-list', nargs='+',
                        help='The list of files to process', required=True)
    parser.add_argument('--dictionary-filename',
                        help='the dictionary words to use for exclusion of non-dictionary words')
    parser.add_argument('--except-rank-under',
                        help='if a word is ranked <= this number in --except-dataset-count datasets, override a drop decision')
    parser.add_argument('--except-dataset-count',
                        help='if a word is ranked <= --except-rank-under in this number of datasets, override a drop decision')
    args = parser.parse_args()
    exception_rank = int(args.except_rank_under)
    exception_count = int(args.except_dataset_count)

    result = {}
    exception_counts = {}
    possible_exceptions = {}
    datasets = []
    dictionary_filter = read_file(args.dictionary_filename)
    for filename in args.file_list:
        datasets.append(read_file(filename))
    for dataset in datasets:
        for word, values in dataset.items():
            if word in dictionary_filter:
                if word not in result:
                    result[word] = []
                result[word].extend(clean(values['examples']))
            elif values['freq'] < exception_rank:
                if word not in possible_exceptions:
                    possible_exceptions[word] = []
                possible_exceptions[word].extend(clean(values['examples']))
                if word not in exception_counts:
                    exception_counts[word] = 0
                exception_counts[word] += 1
    for word, examples in possible_exceptions.items():
        if exception_counts[word] > exception_count:
            result[word] = examples
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
