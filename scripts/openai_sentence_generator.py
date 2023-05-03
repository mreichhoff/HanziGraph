import json
import openai
import argparse
import os
from itertools import islice
import concurrent.futures
from time import sleep

openai.api_key = os.getenv("OPENAI_API_KEY")
BATCH_SIZE = 150


def batched(iterable, n):
    # split an array into chunks of size N
    it = iter(iterable)
    while True:
        batch = list(islice(it, n))
        if not batch:
            return
        yield batch


def split(a, n):
    # split an array into N chunks
    k, m = divmod(len(a), n)
    return (a[i*k+min(i, m):(i+1)*k+min(i+1, m)] for i in range(n))


def generate_prompt(word):
    return f"As a Chinese language instructor, give your students 3 memorable example sentences, with pinyin and an English translation, for the word ${word}. The format should be the Chinese sentence, then a newline, then the pinyin, then a newline, then the English translation, with no numbers in front."


def generate_chat_instruction(word):
    return f"Give your students 3 memorable example sentences, with pinyin and an English translation, for the word ${word}. The format should be the Chinese sentence, then a newline, then the pinyin, then a newline, then the English translation."


BATCH_SIZE = 20


def run_batch_completions(batch):
    result = {}
    batched_words = list(batched(batch, BATCH_SIZE))
    for batch in batched_words:
        prompts = [generate_prompt(word) for word in batch]
        try:
            response = openai.Completion.create(
                model="text-davinci-003",
                prompt=prompts,
                temperature=0.7,
                max_tokens=500,
            )
        except:
            # error calling? Just bail for now instead of trying to recover.
            return result
        for choice in response.choices:
            result[batch[choice.index]] = choice.text
        # the limits are per minute. The requests take awhile, so could probably lower this
        # could also use the response's initiated timestamp and do some math...
        sleep(60)
    return result


def run_batch_chat(batch):
    result = {}
    # there's no batch endpoint for ChatCompletion, unfortunately.
    # could do "give me sentences for the following wordlist", but that gets much more complicated.
    for word in batch:
        try:
            # get the result; handle parsing and data wrangling as a post-process step.
            # for whatever reason, the chat version does not obey formatting requests (maybe prompt issue, though several were tried)
            result[word] = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a Chinese language teacher."},
                    {"role": "user",
                        "content": generate_chat_instruction(word)}
                ]
            )
        except:
            # error calling? Just bail for now instead of trying to recover.
            return result
        # the limits are per minute. The requests take awhile, so could probably lower this
        # could also use the response's initiated timestamp and do some math...
        sleep(60)
    return result


def main():
    parser = argparse.ArgumentParser(
        description='Get example sentences via OpenAI davinci completion')
    parser.add_argument(
        '--word-list', help='the filename of a list of words to fetch examples for')
    parser.add_argument(
        '--mode', help='completions or chat', default='chat')
    parser.add_argument(
        '--num-threads', help='how many threads to call openai in parallel; their free tier: 3rpm', default=3)
    args = parser.parse_args()
    with open(args.word_list) as f:
        words = json.load(f)
        num_threads = int(args.num_threads)
        batched_words = list(split(words, num_threads))
        futures = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_threads) as executor:
            for batch in batched_words:
                if args.mode == 'completions':
                    futures.append(executor.submit(
                        run_batch_completions, batch))
                else:
                    futures.append(executor.submit(run_batch_chat, batch))
        all_results = {}
        for future in futures:
            all_results = all_results | future.result()
        print(json.dumps(all_results, ensure_ascii=False))


if __name__ == '__main__':
    main()
