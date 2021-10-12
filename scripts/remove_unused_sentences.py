import json
from functools import reduce
import argparse


class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)


character_and_word_set = set()


def get_character_and_word_set(graph):
    for key in graph.keys():
        character_and_word_set.add(key)
        for edge in graph[key]['edges'].keys():
            character_and_word_set.add(edge)
            character_and_word_set.update(graph[key]['edges'][edge]['words'])


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
        '--graph-filename', help='the filename of the graph data')
    parser.add_argument(
        '--sentences-filename', help='the filename of the unpruned example sentences')
    parser.add_argument(
        '--frequency-list-filename', help='the filename of a frequency list, used to sort results by average word frequency')
    args = parser.parse_args()

    sentences = get_current_sentences(args.sentences_filename)
    graph = get_graph(args.graph_filename)
    freq_dict = get_word_frequencies(args.frequency_list_filename)

    get_character_and_word_set(graph)
    max_per = 5
    used_sentences = []
    seen_sentences = set()

    # unfortunate this is duplicated from the frontend implementation...
    # also unfortunate it requires freq sorted input and then has to re-sort
    for item in character_and_word_set:
        count = 0
        bad_examples = []
        for sentence in sentences:
            # don't want to check seen sentences here because we can reuse them
            # I'm nothing if not patient
            if item in sentence['zh'] and 'en' in sentence:
                count = count + 1
                if(count > max_per):
                    break
                if ''.join(sentence['zh']) not in seen_sentences:
                    used_sentences.append(sentence)
                    seen_sentences.add(''.join(sentence['zh']))
            elif item in sentence['zh']:
                bad_examples.append(sentence)
        if count < 5 and len(bad_examples) > 0:
            for i in range(0, min(len(bad_examples), (max_per - count))):
                if ''.join(bad_examples[i]['zh']) not in seen_sentences:
                    used_sentences.append(bad_examples[i])
                    seen_sentences.add(''.join(bad_examples[i]['zh']))
    get_average_frequency(used_sentences, freq_dict)
    used_sentences.sort(key=lambda entry: entry['freq'])
    remove_freq_field(used_sentences)
    print(json.dumps(used_sentences, ensure_ascii=False))


if __name__ == '__main__':
    main()
