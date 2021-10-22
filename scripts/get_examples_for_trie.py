import json
from heapq import heappush, heappushpop
import nltk
import argparse
import jieba
from functools import reduce


def load_trie(filename):
    trie = {}
    with open(filename) as f:
        trie = json.load(f)
    return trie


def get_average_frequency(word_frequencies, words):
    # words assumed to be properly lowercased, etc.
    return reduce(lambda a, b: a + b, [word_frequencies[word]
                                       if word in word_frequencies else len(word_frequencies) for word in words]) / len(words)


def get_word_frequencies(filename):
    with open(filename) as f:
        return {value.strip(): idx for idx, value in enumerate(f)}


def remove_freq_field(trie):
    if "__e" in trie:
        trie["__e"] = [(item[1], item[2]) for item in trie["__e"]]
    for key in trie:
        if key == '__e':
            continue
        remove_freq_field(trie[key])


zh_punctuation = {'。', '‘', '’', '“', '”', '，',
                  '？', '!', '...', '.', '! ', '?', ' ', '！', '"', '\'', ','}


def get_words(language, sentence):
    if language == 'chinese':
        return [x for x in jieba.cut(sentence) if x not in zh_punctuation]
    else:
        return [x.lower() for x in nltk.word_tokenize(sentence, language=language)
                if any(letter.isalpha() for letter in x)]


def get_tokens(language, sentence):
    # TODO could probably combine with get_words at some level
    if language == 'chinese':
        return [x for x in jieba.cut(sentence)]
    else:
        return [x for x in nltk.word_tokenize(sentence, language=language)]


def main():
    parser = argparse.ArgumentParser(
        description='Get examples for ngrams in a trie')
    parser.add_argument(
        '--language', help='a lowercase language name, like chinese or english')
    parser.add_argument(
        '--trie-filename', help='the filename of a trie in json format')
    parser.add_argument(
        '--frequency-list-filename', help='the filename of a frequency list, one word per line')
    parser.add_argument(
        '--target-sentences-filename', help='the filename of a list of sentences in the target language')
    parser.add_argument(
        '--base-sentences-filename', help='the filename of a list of sentences in the base language')
    parser.add_argument('--top-level-only', default=True,
                        action=argparse.BooleanOptionalAction)
    parser.add_argument(
        '--output-dir', help='the directory in which to output lower-layer files. There may be many.')

    args = parser.parse_args()

    trie = load_trie(args.trie_filename)
    freqs = get_word_frequencies(args.frequency_list_filename)
    if args.top_level_only:
        # no need for other layers in this case
        trie = {key: {'__e': []} for key in trie.keys()}
    with open(args.target_sentences_filename) as target_sentences:
        with open(args.base_sentences_filename) as base_sentences:
            for line in target_sentences:
                base = base_sentences.readline().strip()
                target = line.strip()
                words = get_words(args.language, target)
                target_tokens = get_tokens(args.language, target)
                if(len(words) == 0):
                    continue
                freq = get_average_frequency(freqs, words)
                if args.top_level_only:
                    for word in words:
                        # we separate top-level (loaded up front) from lower levels (loaded on demand)
                        # as a performance optimization on the frontend
                        if word in trie:
                            if len(trie[word]['__e']) < 3:
                                heappush(trie[word]['__e'],
                                         (-freq, target_tokens, base))
                            else:
                                heappushpop(
                                    trie[word]['__e'], (-freq, target_tokens, base))
                else:
                    for i in range(len(words)-1):
                        word = words[i]
                        next_word = words[i+1]
                        if i+2 < len(words):
                            final_word = words[i+2]
                            # check trigram
                            if word in trie and next_word in trie[word] and final_word in trie[word][next_word]:
                                if '__e' not in trie[word][next_word][final_word]:
                                    trie[word][next_word][final_word]['__e'] = []
                                if len(trie[word][next_word][final_word]['__e']) < 3:
                                    heappush(
                                        trie[word][next_word][final_word]['__e'], (-freq, target_tokens, base))
                                else:
                                    heappushpop(
                                        trie[word][next_word][final_word]['__e'], (-freq, target_tokens, base))
                        if word in trie and next_word in trie[word]:
                            if '__e' not in trie[word][next_word]:
                                trie[word][next_word]['__e'] = []
                            if len(trie[word][next_word]['__e']) < 3:
                                heappush(
                                    trie[word][next_word]['__e'], (-freq, target_tokens, base))
                            else:
                                heappushpop(
                                    trie[word][next_word]['__e'], (-freq, target_tokens, base))
    remove_freq_field(trie)
    if args.top_level_only:
        print(json.dumps(trie, ensure_ascii=False))
    else:
        for key in trie:
            with open(f"{args.output_dir.rstrip('/')}/{key}.json", 'w') as f:
                json.dump(trie[key], f, ensure_ascii=False)


if __name__ == '__main__':
    main()
