# Stats are organised by subject, not source

Stats split into Personal (`src/data/stats/personal.tsx`) and Site (`src/data/stats/site.ts`) by **what the fact is about** — the site owner vs the website itself — not by where the value comes from. A Personal Stat that switches from hardcoded to API-fetched tomorrow stays a Personal Stat; only its subject decides the bucket.

## Considered Options

- **Subject (chosen).** Stable under refactors: changing how a value is computed never moves the file. The cost is that `personal.tsx`'s renderer doesn't yet support fetched values — adding the first fetched Personal Stat will require an upgrade. That's an implementation gap, not a model violation.
- **Source — handcrafted vs API-fetched (rejected).** Would force facts to migrate buckets when the implementation changes. Switching "Countries visited: 27" from a literal to a Strava-fetched value would require a file move even though the fact itself is unchanged. Source-driven splits are unstable under refactors.
- **Quadrant — subject × source, up to 4 files (rejected).** Overkill for a `/stats` page with ~7 entries. Would proliferate files (`github-repo.ts`, `github-user.ts`, `wakatime.ts`, …) as more API sources are added, for no UX payoff: the page renders one table.
