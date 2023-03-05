import json
import argparse
from math import log10
from nltk.stem.wordnet import WordNetLemmatizer
from operator import itemgetter

lemmatizer = WordNetLemmatizer()

blocklist = set([
    "Taiwan pr.",
    "abbr. ",
    "also pr.",
    "also rendered",
    "also translated",
    "also transliterated",
    "also used",
    "also written",
    "alternative name for",
    "ancient Chinese compass point: ",
    "another name for",
    "archaic variant of ",
    "cf",
    "classifier ",
    "classifier:",
    "erhua variant",
    "erroneous variant",
    "name of",
    "nickname for",
    "nickname of",
    "old variant of",
    "pr. ",
    "same as ",
    "sb",
    "see ",
    "surname ",
    "two-character surname ",
    "variant of "
])

start_subs = {
    "refers to ": "",
    "to be ": "",
    "to ": "",
    "the ": ""
}

global_subs = {
    "esp.": "especially",
    "fig. ": "",
    "sth": "something",
    "lit. ": "",
    ")": "",
    "(": "",
    "“": "",
    "”": "",
    '"': '',
    # "'": "",
    "!": "",
    ",": '',
    '.': '',
    '?': ''
}


def clean(definition):
    result = definition
    for term, substitute in start_subs.items():
        if definition.startswith(term):
            result = result.replace(term, substitute, 1)
    if result.endswith(')') and '(' in result:
        result = result[0:result.rindex('(')].strip()
    if result.startswith('(') and ')' in result:
        result = result[(1+result.index(')')):].strip()
    for term, substitute in global_subs.items():
        result = result.replace(term, substitute)
    return result


def get_word_frequencies(filename):
    with open(filename) as f:
        freqs = json.load(f)
        return {value.strip(): idx for idx, value in enumerate(freqs)}


def should_block(definition):
    for item in blocklist:
        if definition.startswith(item):
            return True
    return False


def is_ascii(word):
    try:
        bytes(word, 'ascii')
        return True
    except:
        return False


def is_number(word):
    try:
        int(word)
        return True
    except:
        return False


def should_include(word):
    if '[' in word or ']' in word:
        return False
    if not is_ascii(word) or is_number(word):
        return False
    return True


def get_best(sorted_list_of_scores):
    count = 0
    saw_delta = False
    result = []
    last_score = None
    while count < len(sorted_list_of_scores) and (count < 8 or not saw_delta):
        result.append(
            (sorted_list_of_scores[count][0], sorted_list_of_scores[count][1]))
        if last_score and sorted_list_of_scores[count][1] != last_score:
            saw_delta = True
        last_score = sorted_list_of_scores[count][1]
        count += 1

    return result


def main():
    parser = argparse.ArgumentParser(
        description='Get Chinese translations for English words based on tf-idf. Outputs JSON.')
    parser.add_argument(
        '--dict-filename', help='the dictionary filename, output by dictionary.py')
    parser.add_argument(
        '--frequency-list-filename', help='the dictionary filename, output by dictionary.py')

    args = parser.parse_args()
    dictionary_entries = {}
    with open(args.dict_filename) as f:
        dictionary_entries = json.load(f)
    freqs = get_word_frequencies(args.frequency_list_filename)

    english_candidates = {}
    document_counts = {}
    total_documents = 0
    for chinese_word, definition_list in dictionary_entries.items():
        definitions = [clean(definition['en'])
                       for definition in definition_list if not should_block(definition['en'])]
        for definition in definitions:
            counts = {}
            total = 0
            english_words = [word.lower() for word in definition.split(' ')]
            if len(english_words) > 1 and len(english_words) < 4:
                # if it's a two or three word definition, we could do some tfidf thing, but
                # just trust CEDICT and frequency lists to get to a good state
                if definition not in english_candidates:
                    english_candidates[' '.join(english_words)] = {}
                english_candidates[' '.join(english_words)][chinese_word] = 1
            for word in english_words:
                if word not in english_candidates:
                    english_candidates[word] = {}
                if word not in counts:
                    counts[word] = 0
                    if word not in document_counts:
                        document_counts[word] = 0
                    document_counts[word] += 1
                counts[word] += 1
                total += 1
            for word, count in counts.items():
                if chinese_word not in english_candidates[word]:
                    english_candidates[word][chinese_word] = count/total
                english_candidates[word][chinese_word] = max(
                    count / total, english_candidates[word][chinese_word])
            total_documents += 1
    idfs = {}
    for word, count in document_counts.items():
        idfs[word] = log10(total_documents / count)
    for word, candidates in english_candidates.items():
        if len(word.split(' ')) > 1:
            continue
        for candidate, tf in candidates.items():
            english_candidates[word][candidate] = tf * idfs[word]
    result = {}
    for word, candidates in english_candidates.items():
        if not should_include(word):
            continue
        best = [(match[0], match[1]) for match in sorted(
            [(key, value, -freqs[key])
             for key, value in candidates.items()],
            key=itemgetter(1, 2),
            reverse=True
        )][0:5]
        result[word] = best
    for word in result.keys():
        possible_infinitive = lemmatizer.lemmatize(word, 'v')
        possible_noun = lemmatizer.lemmatize(word, 'n')
        if possible_infinitive != word and possible_infinitive in result:
            result[word].extend(result[possible_infinitive])
        if possible_noun != word and possible_noun in result:
            result[word].extend(result[possible_noun])
    for word, matches in result.items():
        best = [match[0] for match in sorted(
            [(key[0], key[1], -freqs[key[0]])
             for key in matches],
            key=itemgetter(1, 2),
            reverse=True
        )][0:5]
        result[word] = best

    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
