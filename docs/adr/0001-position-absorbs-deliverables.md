# Code authored inside a Position lives in that Position's highlights, not in projects.ts

`projects.ts` is reserved for portfolio-worthy buildable artefacts authored *outside* the scope of any Position; deliverables built during a Position (e.g. an internal tool from the Visa internship, even with a public repo) belong to that Position's JSON Resume `highlights` and are never dual-listed. Activity- and Education-context artefacts (a club website, a CS2106 shell) do surface as separate Project entries — the asymmetry is deliberate, because Project is the independent signal a recruiter scans for, while a Position's deliverables read most naturally as "what you did at X" inside the X entry.

## Considered Options

- **Treat any buildable artefact as a Project regardless of where it was authored.** Rejected: would inflate `projects.ts` with employer-owned work and dilute the independent signal.
- **Allow dual-listing — a Position deliverable also appears as a Project.** Rejected as redundant; muddies the recruiter scan with no added information.
