import json
import jieba
from functools import reduce
import argparse


def get_word_frequencies(filename):
    with open(filename) as f:
        return {value.strip(): idx for idx, value in enumerate(f)}


def get_average_frequency(sentences, word_frequencies):
    for key in sentences.keys():
        words = set(sentences[key]['zh'])
        # TODO: how did you ever write this list comprehension!?
        sentences[key]['freq'] = reduce(lambda a, b: a + b, [word_frequencies[word]
                                        if word in word_frequencies else len(word_frequencies) for word in words]) / len(words)


def get_transcriptions(filename, character_type):
    # transcriptions header: zh_id lang format zh_text
    # we assume (due to pre-processing) the number of fields will be correct
    # TODO could add an option for using empty sentences dict if needed
    result = {}
    language_key = 'Hans' if character_type == 'simplified' else 'Hant'
    with open(filename) as f:
        for line in f:
            fields = line.split('\t')
            if fields[2].startswith(language_key):
                if fields[0] not in result:
                    result[fields[0]] = {}
                # because zh_text can be duplicated in get_translations, overwrite to ensure the transcription matches the actual text
                result[fields[0]]['zh'] = fields[3].strip()
            if fields[2].startswith('Latn') and fields[0] in result:
                result[fields[0]]['pinyin'] = fields[3].strip()
    return result


def get_translations(filename, result):
    # tsv header: zh_id zh_text en_id en_text
    # zh_text can be duplicated; we prefer to get zh_text from transcriptions
    # we assume (due to pre-processing) the number of fields will be correct
    with open(filename) as f:
        for line in f:
            fields = line.split('\t')
            if fields[0] in result and 'en' not in result[fields[0]]:
                result[fields[0]]['en'] = fields[3].strip()


def tokenize(sentences):
    for key in sentences.keys():
        tokenized = list(jieba.cut(sentences[key]['zh']))
        sentences[key]['zh'] = tokenized


def remove_freq_field(result_list):
    for item in result_list:
        item.pop('freq')


def main():
    parser = argparse.ArgumentParser(
        description='Get tokenized Chinese/English/pinyin examples and sort by average word frequency.')
    parser.add_argument(
        '--transcription-filename', help='the filename of a file of pinyin transcriptions')
    parser.add_argument(
        '--translation-filename', help='the filename of a file of zh-en translations')
    parser.add_argument(
        '--character-type', help='simplified or traditional characters')
    parser.add_argument(
        '--frequency-list-filename', help='the filename of a file of Chinese words, ranked by frequency, one per line')
    args = parser.parse_args()

    freq_dict = get_word_frequencies(args.frequency_list_filename)
    sentences = get_transcriptions(
        args.transcription_filename, args.character_type)
    get_translations(args.translation_filename, sentences)
    tokenize(sentences)
    get_average_frequency(sentences, freq_dict)
    result = list(sentences.values())
    result.sort(key=lambda entry: entry['freq'])
    # shrinking ever so slightly, but not needed on the frontend
    remove_freq_field(result)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
