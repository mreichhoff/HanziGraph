import json
import argparse

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


def collapse_sentences(partition):
    result = []
    deduplicator = set()
    for sentences in partition.values():
        for sentence in sentences:
            if ''.join(sentence['zh']) not in deduplicator:
                deduplicator.add(''.join(sentence['zh']))
                result.append(sentence)
    return result


def main():
    parser = argparse.ArgumentParser(
        description='partition some files that are too large to be loaded immediately on the client side')
    parser.add_argument('--dictionary-filename',
                        help='The dictionary file to partition', required=True)
    parser.add_argument(
        '--n', help='the number of desired partitions')
    parser.add_argument(
        '--output-dir', help='where to write partitioned definitions')
    parser.add_argument(
        '--collapse', help='collapse the partition into a single array', action=argparse.BooleanOptionalAction)
    args = parser.parse_args()
    partitions = []
    n = int(args.n)
    for _ in range(n):
        partitions.append({})
    definitions = {}
    with open(args.dictionary_filename) as f:
        definitions = json.load(f)
    for word, defs in definitions.items():
        partition = get_partition(word, n)
        partitions[partition][word] = defs
    count = 0
    for partition in partitions:
        with open(f"{args.output_dir}/{count}.json", 'w') as f:
            json.dump(partition if not args.collapse else collapse_sentences(
                partition), f, ensure_ascii=False)
            count = count+1


if __name__ == '__main__':
    main()
