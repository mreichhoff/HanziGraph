import string
from functools import reduce
import jieba
from fugashi import Tagger
tagger = Tagger('-Owakati')

zh_punctuation = {'《', '》','(', ')', '・', '（', '）', ' ', '。', '‘', '’', '“', '”', '，',
                  '？', '!', '...', '.', '! ', '?', ' ', '！', '"', '\'', ',', '、', '-', '「', '」', '．'}
zh_puntuation_string = ''.join(zh_punctuation)
ja_punctuation = zh_punctuation
ja_punctuation_string = zh_puntuation_string


def should_block(sentence, blocklist):
    sentence_lowered = sentence.lower()
    for word in blocklist:
        if word in sentence_lowered:
            return True
    return False


def join(tokens, language):
    # TODO: including the spaces can make it a bit easier to understand even for these languages...
    # if language == 'chinese' or language == 'japanese':
    #     return ''.join(tokens)
    return ' '.join(tokens)


def get_words_with_punctuation(line, language):
    # tokenize the words, not normalizing case or removing punctuation
    # in theory, allowing easy reconstruction of the original text
    # while making it possible to differentiate between the tokens
    if language == 'chinese':
        # TODO handle non-space delimited, such as chinese or japanese
        return list(jieba.cut(line))
    elif language == 'japanese':
        return [str(x) for x in tagger(line)]
    # TODO: experimenting with space only for now instead of nltk
    return line.split(' ')


def normalize_case(word, ignore_case):
    if ignore_case:
        return word.lower()
    return word


def tokenize(line, language, ignore_case):
    # TODO handle non-space delimited, such as chinese or japanese
    if language == 'chinese':
        return [x.strip(zh_puntuation_string) for x in jieba.cut(line)]
    elif language == 'japanese':
        return [str(x).strip(ja_punctuation_string) for x in tagger(line)]
    # TODO: experimenting with space only for now instead of nltk
    return [normalize_case(x, ignore_case).strip(string.punctuation + '¿' + '¡' + ' ') for x in line.split(' ')]


def get_average_frequency_rank(word_frequencies, words):
    # if there are no words, it's a bogus sentence
    # ideally this gets skipped upstream though...
    if len(words) == 0:
        return 10000000
    # words assumed to be properly lowercased, etc.
    return reduce(lambda a, b: a + b, [word_frequencies[word]
                                       if word in word_frequencies else len(word_frequencies) for word in words]) / len(words)
