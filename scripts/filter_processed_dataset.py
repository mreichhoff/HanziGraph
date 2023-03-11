import argparse
import json


def read_processed_dataset(filename):
    with open(filename) as f:
        return json.load(f)


def get_existing_data(filename):
    result = set()
    with open(filename) as f:
        sentences = json.load(f)
        for sentence in sentences:
            zh = sentence['zh']
            for character in ''.join(zh):
                result.add(character)
            for word in zh:
                result.add(word)
    return result


def main():
    parser = argparse.ArgumentParser(
        description='Filter out those words and characters that have examples in a better dataset')
    parser.add_argument(
        '--sentences-filename',
        help='The existing sentences, as output of examples.py, remove_unused_sentences.py, or find_examples_for_set.py')
    parser.add_argument('--processed-words-filename',
                        help='the output of process_dataset in words mode')
    parser.add_argument('--processed-chars-filename',
                        help='the output of process_dataset in characters mode')
    args = parser.parse_args()

    existing_chars_and_words = get_existing_data(args.sentences_filename)
    chars_dataset = read_processed_dataset(args.processed_chars_filename)
    words_dataset = read_processed_dataset(args.processed_words_filename)

    for item in existing_chars_and_words:
        if item in chars_dataset:
            del chars_dataset[item]
        if item in words_dataset:
            del words_dataset[item]
    # note that chars_dataset wins if there are duplicates.
    # in cases where a character is a word, this does mean it could be overwritten,
    # but the sentences should be simpler
    # TODO: is that correct behavior?
    result = words_dataset | chars_dataset

    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
