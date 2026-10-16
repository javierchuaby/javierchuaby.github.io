# Javier Portfolio CLI

The official CLI for [Javier Chua's public portfolio API](https://javierchuaby.dev/api/).
Requires Node.js 24. No API key or runtime dependencies.

```sh
npm install --global @javierchuaby/portfolio-cli
javier-portfolio profile
javier-portfolio projects --json
```

Commands: `profile`, `work`, `projects`, `skills`, `contact`. Each fetches the matching
`/api/v1/{resource}` endpoint. Standard output contains formatted JSON followed by a
newline; errors go to standard error with a nonzero exit status. `--json` is explicit
but optional. Skill prominence is a subjective display weight, not proficiency.

```sh
javier-portfolio --help
javier-portfolio --version
javier-portfolio work --base-url http://localhost:8787 --timeout-ms 5000
```

`--base-url` accepts an HTTPS origin or HTTP on `localhost`, `127.0.0.1`, or `[::1]`.
Paths, credentials, query strings, and fragments are rejected. Redirects are not
followed. The default origin is `https://javierchuaby.dev`; requests time out after
10 seconds. `--timeout-ms` accepts an integer from 1 to 120000.

HTTP errors, invalid JSON, unexpected media types, and network failures exit with
status 1. HTTP 429 includes a valid `Retry-After` delay or date when supplied. The
CLI makes one request and does not retry automatically. It does not print remote
error bodies or echo supplied credentials.

For maintainers, run `npm test` from this directory. Create a package with
`npm pack --pack-destination /tmp` and inspect its contents before publishing.
