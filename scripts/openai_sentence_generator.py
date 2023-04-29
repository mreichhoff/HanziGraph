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
    return f"As a Chinese language instructor, give your students 3 memorable example sentences, with pinyin and an English translation, for the word ${word}. The format should be the Chinese sentence, then a comma, then the pinyin, then a comma, then the English translation, with no numbers in front."


def get_response(prompts):
    return openai.Completion.create(
        model="text-davinci-003",
        prompt=prompts,
        temperature=0.7,
        max_tokens=500,
    )


BATCH_SIZE = 20


def run_batch(batch):
    result = {}
    batched_words = list(batched(batch, BATCH_SIZE))
    for batch in batched_words:
        prompts = [generate_prompt(word) for word in batch]
        response = openai.Completion.create(
            model="text-davinci-003",
            prompt=prompts,
            temperature=0.7,
            max_tokens=500,
        )
        for choice in response.choices:
            result[batch[choice.index]] = choice.text
        # the limits are per minute. The requests take awhile, so could probably lower this
        sleep(60)
    return result


def main():
    parser = argparse.ArgumentParser(
        description='Get example sentences via OpenAI davinci completion')
    parser.add_argument(
        '--word-list', help='the filename of a list of words to fetch examples for')
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
                futures.append(executor.submit(run_batch, batch))
        all_results = {}
        for future in futures:
            all_results = all_results | future.result()
        print(json.dumps(all_results, ensure_ascii=False))


if __name__ == '__main__':
    main()
