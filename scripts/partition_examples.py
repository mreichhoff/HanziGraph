import argparse
import json


def get_word_set(filename):
    with open(filename) as f:
        return {value.strip(): [] for value in f}


# requirements:
# * no external library on the js side
# * stable
# * approximately equal partition sizes
# testing shows this meets all criteria
def get_partition(word, total_partitions):
    total = 0
    for character in word:
        total += ord(character)
    return total % total_partitions


def main():
    parser = argparse.ArgumentParser(
        description='partition some sentence files that are too large to be loaded immediately on the client side')
    parser.add_argument(
        '--target-words-filename', help='the filename of the words for which examples are needed')
    parser.add_argument('-f', '--file-list', nargs='+',
                        help='The list of files to process', required=True)
    parser.add_argument(
        '--n', help='the number of desired partitions')
    parser.add_argument(
        '--output-dir', help='where to write partitioned sentences')
    args = parser.parse_args()

    MAX_EXAMPLES = 2
    partitions = []
    n = int(args.n)
    for _ in range(n):
        partitions.append([])

    target_words = get_word_set(args.target_words_filename)
    for file in args.file_list:
        with open(file) as f:
            sentences = json.load(f)
            for sentence in sentences:
                used_sentence = {}
                for word in sentence['zh']:
                    if word in target_words and len(target_words[word]) < MAX_EXAMPLES:
                        partition = get_partition(word, n)
                        if partition not in used_sentence:
                            target_words[word].append(sentence)
                            partitions[partition].append(sentence)
                            used_sentence[partition] = True
                for character in ''.join(sentence['zh']):
                    if character in target_words and len(target_words[character]) < MAX_EXAMPLES:
                        partition = get_partition(character, n)
                        if partition not in used_sentence:
                            target_words[character].append(sentence)
                            partitions[partition].append(sentence)
                            used_sentence[partition] = True

    count = 0
    for partition in partitions:
        with open(f"{args.output_dir}/{count}.json", 'w') as f:
            # print(len(partition))
            json.dump(partition, f, ensure_ascii=False)
            count = count+1


if __name__ == '__main__':
    main()
