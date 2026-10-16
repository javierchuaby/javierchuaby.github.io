# Agent readiness

The portfolio remains a Next.js static export. HTML and Markdown use the same
content: `pnpm build` converts each exported page's `<main>` into an adjacent
`index.md`, removing scripts, icons, and decorative content. `/llms.txt` follows
the [published format](https://llmstxt.org/) and links to those Markdown files.
Cloudflare Workers serves the production domain. The previous GitHub Pages publisher has been retired.

## Content negotiation and deployment

GitHub Pages cannot vary responses by the request's `Accept` header. The included
Cloudflare Worker serves the exported assets with content negotiation at the
original page URLs, including `/`. It selects HTML by default, honors media-range
specificity and quality values, sets `Vary: Accept` on negotiated responses,
returns 406 for unsupported representations, and preserves real 404 statuses
with an explanatory Markdown body when Markdown is preferred. Non-page assets
keep their original media types. HEAD uses the same status and headers as GET.
The Worker does not cache negotiated responses separately; the ASSETS binding
looks up distinct HTML and Markdown files so they cannot share an HTML validator.

Preview the actual serving layer locally:

```sh
pnpm build
pnpm preview:agents
# In another terminal:
pnpm verify:agents
```

`pnpm verify:agents` checks every sitemap page in both representations, canonical
and alternate metadata, substantive trust pages, structured data, every llms.txt
link, robots.txt, sitemap.xml, Markdown file types, redirects, HEAD, 406, and both
404 bodies. Pass an origin to verify a preview or the live site:

```sh
pnpm verify:agents https://javierchuaby.dev
curl -sS -L -i -H 'Accept: text/markdown' https://javierchuaby.dev/
curl -sS -L -i -H 'Accept: text/html' https://javierchuaby.dev/
curl -sS -L -i -H 'Accept: text/markdown' https://javierchuaby.dev/__agent_missing_page
```

Production is deployed to `javierchuaby.dev` through the Worker, with the custom
domain declared in `wrangler.jsonc`. The production pipeline is:

```sh
git switch main
git pull --ff-only
pnpm run deploy
```

Run this from a clean checkout so untracked files under `public` cannot be
published accidentally. `pnpm run deploy` and `pnpm deploy:worker` run tests, build,
deploy to Cloudflare, and verify the production endpoints. Wrangler authentication
is required. The former GitHub Pages deployment command and dependency have been removed.

The Worker uses the documented
[static assets binding](https://developers.cloudflare.com/workers/static-assets/binding/)
with `run_worker_first` for page URLs and Markdown files. Images, Next.js assets,
and the favicon bypass Worker execution and retain native caching. The
`404-page` setting prevents missing resources from receiving a successful SPA
fallback. Negotiated Markdown rejects missing, empty, or HTML fallback exports.
Explicit Markdown files retain their own conditional request semantics.

The `www` hostname is a proxied A record using Cloudflare's documented placeholder
`192.0.2.1`. A Cloudflare Redirect Rule maps `http*://www.javierchuaby.dev/*` to
`https://javierchuaby.dev/${2}` with status 301 and query-string preservation.
This account-level rule and its DNS record are managed separately from Wrangler;
keep them in place when updating the Worker. Verify both hostnames after changes:

```sh
pnpm verify:agents https://javierchuaby.dev
pnpm verify:agents https://www.javierchuaby.dev
curl -sS -D - -o /dev/null 'https://www.javierchuaby.dev/about/?check=1'
```

The redirect must retain `/about/?check=1`. The custom domain is recorded in
Wrangler so future deployments retain it. GitHub Actions validates pull requests
and `main` without deploying; the production publish remains an explicit command.

The `.md` files are also discoverable through HTML alternate links and the
sitewide `rel="describedby"` link to `/llms.txt`.

## Editorial decisions that remain

- This is a person's portfolio, not an asserted business. The Person has a
  description and professional email ContactPoint. An Organization is emitted only for a current Position and identifies that employer, not the site's operator. Do not fabricate an
  Organization or publish an employer's address/contact as Javier's business.
  If a separate organization should be represented, its identity, public postal
  address, and appropriate contact details need confirmation first.
- The privacy page describes the code's data flows, including conditional Google
  Analytics. Confirm the production analytics configuration and the providers'
  retention practices before adding more specific policy commitments. The hosting paragraph names Cloudflare, the current provider.
- Titles and headings now identify Javier Chua's backend and infrastructure
  engineering portfolio. Search rankings, third-party mentions, and reindexing
  remain external outcomes; do not promise a particular readiness score or rank.

The endpoint checks implement the behavior described by
[Accept Markdown](https://acceptmarkdown.com/). A passing local check does not establish the production state; the deployment pipeline reruns the checks against the custom domain after publishing.
