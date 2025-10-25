## Building and running your application for Docker

When you're ready, start your application by running:
`docker build -t hanzigraph-server .`

Start a container with:
`docker compose up`

Your application will be available at http://localhost:8000.

### Customise Wordlist

You might want to run HanziGraph on your own filtered wordlist instead of the full dictionary provided.

For this, create a `wordlist.json` file containing the array of your words:

```json
[
  "礼物",
  "一起",
  "能",
  "..."
]
```

Then, in `compose.yaml` add a new bind mount to your custom wordlist by adapting `YOUR-PATH-TO`:

```yaml
    ...
    volumes:
      - "<YOUR-PATH-TO>/wordlist.json
        :/usr/src/app/public/data/simplified/wordlist.json
        :ro"
    ...
```

Finally, start the container with `docker compose`.
