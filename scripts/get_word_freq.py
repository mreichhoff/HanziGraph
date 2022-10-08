import json
from heapq import nlargest
import nltk
import argparse
import jieba

zh_punctuation = {'。', '‘', '’', '“', '”', '，', '？', '!', '...', '.', '! ', '?',
                  ' ', '！', '"', '\'', ',', '-', '\\', '、', '：', '/', ':', ')',
                  '_', '）', '（', '>', '*', '+', '；', '–', ';', '[', ']', '—', '【', '】',
                  '•', '»', '(', '}', '{', '·', '@', '©', '&', '》', '《', '#', '$', '…', '・', '--', '=',
                  '－', "「", "」", "®", "~", "<", "→", "°", "～", "●", "×", "..", "......", "Cookie",
                  "―", "︰", "．", "℃", "€", "™", "％", "｜", "", "", "💐", "♪", "／", "◆", "※", "%", "^", "■", "›", "---", "　",
                  "♂", "＆", "★", "£", "", "±", "￥", "『", "』", "¥", "", "≤", "", "«",
                  "∮", "", "", "㎡", "`", "", "", "─", "", "◎", "≥", "", "〜", "＞", "__",
                  "←", "¶", "", "☆", "○", "", "│"}


def parse_cedict_line(line, character_type):
    line = line.rstrip('/').split('/')
    char, _ = line[0].split('[')
    trad, simplified = char.split()

    return simplified if character_type == 'simplified' else trad


def get_dictionary_words(dict_filename, character_type):
    # result = set()
    with open(dict_filename) as f:
        # for line in f:
        #     if not line.startswith('#') and len(line) > 0 and len(line.rstrip('/').split('/')) > 1:
        #         entry = parse_cedict_line(line, character_type)
        #         if entry not in result:
        #             result.add(entry)
        return json.load(f)
    # return result


def get_words(language, sentence, filter):
    if language == 'chinese':
        return [x for x in jieba.cut(sentence) if x in filter and x not in zh_punctuation]
    else:
        return [x.lower() for x in nltk.word_tokenize(sentence, language=language)
                if any(letter.isalpha() for letter in x)]


def main():
    parser = argparse.ArgumentParser(
        description='Get examples for a set of words in a file')
    parser.add_argument(
        '--dict', help='a dictionary file, cedict supported for now')
    parser.add_argument(
        '--language', help='a lowercase language name, like chinese or english')
    parser.add_argument(
        '--limit', help='remove words ranked lower than this limit')
    parser.add_argument('-f', '--file-list', nargs='+',
                        help='The list of files, one sentence per line', required=True)
    parser.add_argument(
        '--custom-dict', help='custom dictionary for tokenization')
    parser.add_argument(
        '--character-type', help='simplified or traditional characters')

    args = parser.parse_args()
    if args.custom_dict:
        jieba.load_userdict(args.custom_dict)
    filter = get_dictionary_words(args.dict, args.character_type)

    raw_result = {}
    for filename in args.file_list:
        with open(filename) as target_sentences:
            for line in target_sentences:
                target = line.strip()
                words = get_words(args.language, target, filter)
                for word in words:
                    if word not in raw_result:
                        raw_result[word] = 0
                    raw_result[word] += 1

    limited = nlargest(min(int(args.limit), len(raw_result)),
                       raw_result.items(), key=lambda kvp: kvp[1])
    for item in limited:
        print(item[0])

    # print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
