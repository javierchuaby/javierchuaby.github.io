# Roadmap

## Recently completed

### Site

- Dark mode with system preference detection and manual toggle
- Theme-aware portraits for light/dark modes
- Modernized favicon with SVG source

### Build and data

- Standardized local development and deployment on Node.js 24 and pnpm 10
- Switched development and production builds to Turbopack
- Migrated Position entries to JSON Resume-compatible work fields

## Planned

### Quality

- Add a small Playwright suite against the static export for route loading, navigation, the responsive menu, theme switching, and resume filtering
- Add automated accessibility checks with `@axe-core/playwright`, then complete a manual WCAG audit for issues automation cannot detect

### Repository

- Allow tracked `.github/workflows/` files and add CI for formatting, linting, type-checking, tests, and builds
- Move deployment from the local `gh-pages` command to GitHub's official Pages actions after a successful `main` build
- Add lightweight protection for `main` after CI exists, including required checks and protection from force pushes and deletion

## Evaluated

### Keep

- Keep the current per-icon FontAwesome imports. Turbopack analysis found no FontAwesome JavaScript in the browser bundle because the icons render in a Server Component
- Keep the site-specific domain model canonical. If external resume interoperability becomes useful, add a [JSON Resume](https://jsonresume.org/) export adapter instead of reshaping the entire site model

### Do not adopt now

- Do not add semantic versioning while the site has no versioned releases or package consumers
