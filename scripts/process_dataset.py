import argparse
import json
import string
from heapq import heappush, heappushpop
import hanzidentifier

from lang_utils import get_average_frequency_rank, get_words_with_punctuation, tokenize, should_block


def should_block(sentence, blocklist):
    sentence_lowered = sentence.lower()
    for word in blocklist:
        if word in sentence_lowered:
            return True
    return False


def get_blocklist(filename):
    with open(filename) as f:
        return [x.strip() for x in f]


def get_frequencies(filename, language, ignore_case, characters_only):
    freqs = {}
    with open(filename) as f:
        for line in f:
            words = tokenize(line.strip(), language,
                             ignore_case) if not characters_only else line.strip()
            for word in words:
                if word == '' or word[0].isnumeric():
                    # TODO: ??
                    continue
                if word not in freqs:
                    freqs[word] = 0
                freqs[word] += 1
    return freqs


def main():
    parser = argparse.ArgumentParser(
        description='Get the simplest possible examples for each word in a dataset')
    parser.add_argument(
        '--base-language', help='a lowercase language name, like chinese or english.')
    parser.add_argument(
        '--target-language', help='a lowercase language name, like chinese or english.')
    parser.add_argument(
        '--base-sentences-filename', help='the filename of a list of sentences in the base language')
    parser.add_argument(
        '--target-sentences-filename', help='the filename of a list of sentences in the target language')
    parser.add_argument('--n', help='the number of examples per word')
    parser.add_argument('--blocklist-filename',
                        help='a filename with vulgar or offensive words that should be excluded')
    parser.add_argument(
        '--min', help='the minimum number of occurrences of a word')
    parser.add_argument(
        '--max-sentence-length', help='discard sentences longer than this')
    parser.add_argument(
        '--character-set', help='simplified vs traditional characters')
    parser.add_argument(
        '--base-ignore-case', help='lowercase all words (recommended except for, e.g., German)', action=argparse.BooleanOptionalAction)
    parser.add_argument(
        '--target-ignore-case', help='lowercase all words (recommended except for, e.g., German)', action=argparse.BooleanOptionalAction)
    parser.add_argument(
        '--get-base-examples', help='find simple target language sentences that contain base language words', action=argparse.BooleanOptionalAction)
    parser.add_argument(
        '--characters-only', help='find examples per character, not per word', action=argparse.BooleanOptionalAction)

    args = parser.parse_args()
    characters_only = args.characters_only
    target_freqs = get_frequencies(
        args.target_sentences_filename, args.target_language, args.target_ignore_case, characters_only)
    sorted_freqs = sorted(
        target_freqs.items(), key=lambda kvp: kvp[1], reverse=True)
    ranked_freqs = {x[0]: index for index, x in enumerate(sorted_freqs)}
    base_ranked_freqs = {}

    word_set = {}
    character_set_predicate = hanzidentifier.is_simplified if args.character_set == 'simplified' else hanzidentifier.is_traditional
    if args.get_base_examples:
        # if attempting to build an index on base language, we still need target frequency
        # because we're looking for the simplest target language sentences with base word.
        # we do not need rankings of base words by frequency, however.
        base_freqs = get_frequencies(
            args.base_sentences_filename, args.base_language, args.base_ignore_case)
        word_set = {key: [] for key,
                    value in base_freqs.items() if value >= int(args.min)}
        sorted_base_freqs = sorted(
            base_freqs.items(), key=lambda kvp: kvp[1], reverse=True)
        base_ranked_freqs = {x[0]: index for index,
                             x in enumerate(sorted_base_freqs)}
    else:
        word_set = {key: [] for key,
                    value in target_freqs.items() if value >= int(args.min) and character_set_predicate(key)}

    blocklist = get_blocklist(args.blocklist_filename)

    for word in blocklist:
        if word in word_set:
            del word_set[word]

    max_sentence_length = int(args.max_sentence_length)
    seen = set()
    with open(args.target_sentences_filename) as target_file:
        with open(args.base_sentences_filename) as base_file:
            for line in target_file:
                target = line.strip()
                base = base_file.readline().strip()
                if should_block(target, blocklist) or should_block(base, blocklist) or len(target) > max_sentence_length or not character_set_predicate(line):
                    continue
                target_tokens = tokenize(
                    target, args.target_language, args.target_ignore_case) if not characters_only else target

                key = target.translate(str.maketrans(
                    '', '', (string.punctuation + '¿' + '¡'))).replace(' ', '')
                if key in seen or len(target_tokens) == 0:
                    continue
                seen.add(key)

                target_words = get_words_with_punctuation(
                    target, args.target_language)
                base_words = get_words_with_punctuation(
                    base, args.base_language)
                if args.get_base_examples:
                    base_tokens = tokenize(
                        base, args.base_language, args.base_ignore_case)
                    average_freq = get_average_frequency_rank(
                        base_ranked_freqs, base_tokens)
                else:
                    average_freq = get_average_frequency_rank(
                        ranked_freqs, tokenize(
                            target, args.target_language, args.target_ignore_case))

                if args.get_base_examples:
                    tokens = tokenize(base, args.base_language,
                                      args.base_ignore_case)
                else:
                    tokens = target_tokens

                for word in tokens:
                    if word not in word_set:
                        continue
                    if len(word_set[word]) < int(args.n):
                        heappush(word_set[word],
                                 (-average_freq, target_words, base_words))
                    else:
                        heappushpop(
                            word_set[word], (-average_freq, target_words, base_words))

    if args.get_base_examples:
        print(json.dumps({key: {'examples': [(x[1], x[2]) for x in sorted(value, key=lambda kvp:kvp[0], reverse=True)]}
                          for key, value in word_set.items()}, ensure_ascii=False))
    else:
        print(json.dumps({key: {'freq': ranked_freqs[key], 'examples': [(x[1], x[2]) for x in sorted(value, key=lambda kvp:kvp[0], reverse=True)]}
                          for key, value in word_set.items()}, ensure_ascii=False))


if __name__ == '__main__':
    main()
