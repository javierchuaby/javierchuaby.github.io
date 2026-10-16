# Personal Portfolio Website

This repository houses the source code for my personal portfolio website.

**Live at**: [javierchuaby.dev](https://javierchuaby.dev)

## Tech Stack

The website is a performance-optimized statically generated website built using:

- **Framework**: Next.js 16
- **Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 & custom properties
- **Formatting/Linting**: Biome
- **Testing**: Vitest with React Testing Library

## Agent access

See [Agent readiness](docs/agent-readiness.md) for Markdown exports, content
negotiation, local endpoint verification, deployment, and remaining editorial
decisions.

## Production deployment

After a PR merges, update a clean checkout of `main` and run `pnpm deploy`.
This runs tests and the production build, deploys to Cloudflare Workers, and
verifies the public domain. `pnpm deploy:worker` is the same Cloudflare pipeline.
The obsolete GitHub Pages publisher has been removed.

GitHub Actions validates PRs and `main` with formatting, lint, type checking,
tests, a production build, and a Worker deployment dry-run. Deployments require
local Wrangler authentication; CI does not contain Cloudflare credentials.
