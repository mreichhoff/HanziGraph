import argparse
import jieba
import json

def parse_allowlist(filename):
    with open(filename) as f:
        return set([line.strip() for line in f])

def fix_for_allowlist(tokens, allowlist):
    result = []
    for token in tokens:
        if token in allowlist:
            result.append(token)
            continue
        if len(token) == 3:
            if token[0] in allowlist and token[1:] in allowlist:
                result.append(token[0])
                result.append(token[1:])
                continue
            if token[0:2] in allowlist and token[2] in allowlist:
                result.append(token[0:2])
                result.append(token[2])
                continue
            # could also do like 'if the latter two in allowlist while 0 isn't', but at this point just go char by char
        if len(token) == 4:
            if token[0:2] in allowlist and token[2:] in allowlist:
                result.append(token[0:2])
                result.append(token[2:])
                continue
            if token[0] in allowlist and token[1:] in allowlist:
                result.append(token[0])
                result.append(token[1:])
                continue
            if token[0:3] in allowlist and token[3:] in allowlist:
                result.append(token[0:3])
                result.append(token[3:])
                continue
        # for character in token:
        #     if character in allowlist:
        #         result.append(character)
    return result

def main():
    parser = argparse.ArgumentParser(
        description='Get examples for a set of words in a file')
    parser.add_argument(
        '--target-filename', help='The file to tokenize.')
    parser.add_argument(
        '--custom-dict', help='Optional. A dictionary file, one word per line, matching jieba\'s custom userdict format.')
    parser.add_argument(
        '--allowlist', help='Optional. The filename of a list of words allowed')
    parser.add_argument(
        '--characters-only', help='find examples per character, not per word', action=argparse.BooleanOptionalAction)
    args = parser.parse_args()

    if args.custom_dict:
        jieba.load_userdict(args.custom_dict)
    
    allowlist = None
    if args.allowlist:
        allowlist = parse_allowlist(args.allowlist)
    
    result = {}

    with open(args.target_filename) as f:
        for line in f:
            stripped_line = line.strip()
            tokens = []
            if args.characters_only:
                if allowlist:
                    tokens = [character for character in line if character in allowlist]
                else:
                    tokens = [character for character in line]
            else:
                tokens = [token for token in jieba.cut(stripped_line)]
                if allowlist:
                    tokens = fix_for_allowlist(tokens, allowlist)
            for token in tokens:
                if token not in result:
                    result[token] = 0
                result[token] += 1
    print(json.dumps(result, ensure_ascii=False))

if __name__ == '__main__':
    main()