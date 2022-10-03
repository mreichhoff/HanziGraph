import json
from functools import reduce
import argparse


class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)


def get_character_and_word_set(filename):
    # TODO: read in that top25k levels thing here, use that instead
    with open(filename) as f:
        defs = json.load(f)
        return {word: 0 for word in defs.keys()}
        # return {line.strip().split('\t')[0] for line in f}


def get_word_frequencies(filename):
    with open(filename) as f:
        return {value.strip(): idx for idx, value in enumerate(f)}


def get_average_frequency(sentences, word_frequencies):
    # TODO duplicated elsewhere
    punctuation = {'。', '‘', '’', '“', '”', '，', '？'}
    for sentence in sentences:
        words = set(sentence['zh']) - punctuation
        sentence['freq'] = reduce(lambda a, b: a + b, [word_frequencies[word]
                                  if word in word_frequencies else len(word_frequencies) for word in words]) / len(words)


def remove_freq_field(result_list):
    for item in result_list:
        item.pop('freq')


def get_current_sentences(sentences_filename):
    sentences = []
    with open(sentences_filename) as f:
        sentences = json.load(f)
    return sentences


def get_graph(graph_filename):
    graph = {}
    with open(graph_filename) as f:
        graph = json.load(f)
    return graph


def main():
    parser = argparse.ArgumentParser(
        description='Use example finding logic to determine which sentences are reachable and prune those that aren\'t')
    parser.add_argument(
        '--vocab-filename', help='the filename of the graph data')
    parser.add_argument(
        '--sentences-filename', help='the filename of the unpruned example sentences')
    parser.add_argument(
        '--frequency-list-filename', help='the filename of a frequency list, used to sort results by average word frequency')
    args = parser.parse_args()

    sentences = get_current_sentences(args.sentences_filename)
    freq_dict = get_word_frequencies(args.frequency_list_filename)

    character_and_word_set = get_character_and_word_set(args.vocab_filename)
    max_per = 3
    used_sentences = []
    seen_sentences = set()

    # unfortunate this is duplicated from the frontend implementation...
    # also unfortunate it requires freq sorted input and then has to re-sort
    for sentence in sentences:
        used_sentence = False
        joined = ''.join(sentence['zh'])
        if joined in seen_sentences or 'en' not in sentence:
            continue
        seen_sentences.add(joined)
        for word in sentence['zh']:
            if word in character_and_word_set and character_and_word_set[word] < max_per:
                character_and_word_set[word] += 1
                if not used_sentence:
                    used_sentences.append(sentence)
                    used_sentence = True
        for character in joined:
            if character in character_and_word_set and character_and_word_set[character] < max_per:
                character_and_word_set[character] += 1
                if not used_sentence:
                    used_sentences.append(sentence)
                    used_sentence = True
    # for key, value in character_and_word_set.items():
    #     if value == 0:
    #         print(key)
    # TODO: uh...why is this needed? must be a bug in examples.py
    get_average_frequency(used_sentences, freq_dict)
    used_sentences.sort(key=lambda entry: entry['freq'])
    remove_freq_field(used_sentences)
    print(json.dumps(used_sentences, ensure_ascii=False))


if __name__ == '__main__':
    main()
