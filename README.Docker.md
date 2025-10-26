## Building and running your application for Docker

When you're ready, start your application by running:
`docker build -t hanzigraph-server .`

Start a container with:
`docker compose up`

Your application will be available at http://localhost:8000.

### Customise Wordlists and Sentences

You might want to run HanziGraph on your own filtered wordlists instead of the full dictionary provided.

For this, create a `wordlist.json` file containing the array of your words:

```json
[
  "礼物",
  "一起",
  "能",
  "..."
]
```

Then, in `compose.yaml` add a new bind mount to your custom wordlist by adapting `YOUR-PATH-TO` and `TARGET-CHARSET`.    
`TARGET-CHARSET` should be one of `simplified`, `traditional`, `hsk` or `cantonese`.

```yaml
    ...
    volumes:
      - "<YOUR-PATH-TO>/wordlist.json\
        :/usr/src/app/public/data/<TARGET-CHARSET>/wordlist.json\
        :ro"
    ...
```

Similarly, you can customise the available sentences too. Create a `sentences.json` file containing an array with 
elements as the one below. The Chinese translations are split into meaningful words to guide segmentation.

```json
    {
        "en": "Guilin's sceneries are the most beautiful ones under the heaven.",
        "zh": [
            "桂林山水",
            "甲天下",
            "。"
        ],
        "pinyin": "Gui4lin2 shan1shui3 jia3 tian1xia4."
    },
```

Just like with wordlists, activate your custom sentences:

```yaml
    ...
    volumes:
      - "<YOUR-PATH-TO>/sentences.json\
        :/usr/src/app/public/data/<TARGET-CHARSET>/sentences.json\
        :ro"
    ...
```

Finally, start the container with `docker compose`.
