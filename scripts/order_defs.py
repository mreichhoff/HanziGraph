import json
import argparse


def main():
    parser = argparse.ArgumentParser(
        description='Order character definitions by how commonly their pinyin are used in words containing a character')
    parser.add_argument(
        '--traditional-graph-filename', help='a graph like that output by hanzi_graph.py, for traditional characters')
    parser.add_argument(
        '--simplified-graph-filename', help='a graph like that output by hanzi_graph.py, for simplified characters')
    parser.add_argument(
        '--traditional-full-dictionary-filename', help='the full dictionary, for traditional characters')
    parser.add_argument(
        '--simplified-full-dictionary-filename', help='the full dictionary, for simplified characters')
    parser.add_argument(
        '--dictionary-to-sort-filename', help='the dictionary to sort, e.g., mandarin-defs.json')

    args = parser.parse_args()

    graph = {}
    with open(args.traditional_graph_filename) as f:
        graph = json.load(f)

    with open(args.simplified_graph_filename) as f:
        graph = graph | json.load(f)

    full_dict = {}

    with open(args.simplified_full_dictionary_filename) as f:
        full_dict = json.load(f)

    with open(args.traditional_full_dictionary_filename) as f:
        full_dict = full_dict | json.load(f)

    target_dict = {}
    with open(args.dictionary_to_sort_filename) as f:
        target_dict = json.load(f)

    for word, definitions in target_dict.items():
        if len(word) > 1 or (word not in graph) or (word not in full_dict):
            continue
        pinyin_options = {item['pinyin'] for item in target_dict[word]}
        if len(pinyin_options) < 2:
            continue
        words_in_graph = [value['words']
                          for value in graph[word]['edges'].values()]
        all_definitions = {item: full_dict[item]
                           for sublist in words_in_graph for item in sublist}
        all_pinyin = {key: [item['pinyin'] for item in value]
                      for key, value in all_definitions.items()}
        pinyin_counts = {pinyin: 0 for pinyin in pinyin_options}
        # oh no, what have i done
        for key, value in all_pinyin.items():
            index = 0
            indices = []
            for character in key:
                if character == word:
                    indices.append(index)
                index += 1
            for p in value:
                syllables = p.split(' ')
                for i in indices:
                    if syllables[i] not in pinyin_counts:
                        continue
                    pinyin_counts[syllables[i]] += 1
        definitions.sort(
            key=lambda definition: pinyin_counts[definition['pinyin']], reverse=True)

    print(json.dumps(target_dict, ensure_ascii=False))


if __name__ == '__main__':
    main()
