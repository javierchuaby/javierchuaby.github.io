# Personal Portfolio Site

The source for [javierchuaby.dev](https://javierchuaby.dev) — a static personal portfolio. Content lives in TypeScript data files under `src/data/`.

## Language

### Resume

**Position**:
A dated role for which the site owner was formally hired or selected on merit to do engineering-shaped work — internships, full-time engineering roles, RAships under a PI. Entries are ordered most-recent-first; the head is the current job. Lives in `src/data/resume/work.ts` and conforms to the [JSON Resume schema](https://jsonresume.org/schema/).
_Avoid_: Job, role, work entry, employment

**Activity**:
A dated role in the site owner's life that fails one or both of Position's criteria (formal selection on merit, _and_ engineering-shaped work) — leadership posts, sports captaincies, military service, paid teaching. Buildable artefacts produced within an Activity context surface as separate Projects. Lives in `src/data/activities.ts`.
_Avoid_: Experience, extracurricular, engagement

**Project**:
A portfolio-worthy buildable artefact (typically software with a public repository) the site owner authored outside the scope of any Position. Code produced _inside_ a Position belongs to that Position's JSON Resume `highlights`, never here — see ADR-0001. Lives in `src/data/projects.ts`.
_Avoid_: Side project, build, repo, personal project

**Course**:
A specific module taken at a university — completed _or_ currently in progress. Modeled as a top-level concept (sibling of Education), not nested under it. Retained as data in `src/data/resume/courses.ts`, but not currently rendered on the résumé page.
_Avoid_: Class, module, unit, subject

**Skill**:
A named technology the site owner uses, tagged with one or more Categories and a subjective **prominence** weight (1–5) that controls display size and within-category sort order. Prominence is _not_ a proficiency claim — see ADR-0002. Lives in `src/data/resume/skills.ts`.
_Avoid_: Competency, proficiency, expertise, technology, tool

**Category** (of Skills):
A grouping label for Skills — e.g. "Languages", "AI/ML" — with a display colour and a pre-computed text-contrast token (`'dark' | 'light'`) for accessible rendering. Lives in `src/data/resume/skills.ts`.
_Avoid_: Group, tag, bucket, section

**Education**:
A formal academic stage the site owner has completed or expects to — degree, A-Levels, IP, PSLE. The concept is intentionally broader than the English word "degree" because Singapore-relevant earlier stages carry recruitment signal. Lives in `src/data/resume/degrees.ts`.
_Avoid_: Degree, schooling, qualification, education entry, school

### Stats

**Stat**:
A labelled fact displayed as a row on the `/stats` page; each Stat resolves either to a literal `value` (hardcoded or client-computed) or via a `key` lookup into an externally-fetched object. Lives under `src/data/stats/`.
_Avoid_: Statistic, fact, metric, datum

**Personal Stat** (subtype of Stat):
A Stat whose subject is the site owner. Subject (not source) decides placement — see ADR-0003. Lives in `src/data/stats/personal.tsx`.
_Avoid_: Profile stat, bio stat, me-stat

**Site Stat** (subtype of Stat):
A Stat whose subject is the website itself, currently scoped mostly to facts about the GitHub repo housing the site (stars, forks, last-pushed). Lives in `src/data/stats/site.ts`.
_Avoid_: Repo stat, website stat, github stat

### Site

**Route**:
A top-level page of the site with `label`, `path`, and an optional `index: true` flag marking it as the home/identity entry rather than a regular nav peer. Tests enforce exactly one index route, with path `/`. Lives in `src/data/routes.ts`.
_Avoid_: Page, section, link, nav item

**ContactItem**:
A public profile or channel the site owner has _editorially chosen_ to surface — answering "do I want a visitor to see this face of me?", not "will messages here reach me?". Order in the file is meaningful: distinctive social profiles first, email last as the universal fallback. Lives in `src/data/contact.ts`.
_Avoid_: Social link, channel, profile, contact method

**AboutSection**:
A semantic chunk of the About page parsed from `aboutMarkdown` — `# Intro` becomes the Intro, each subsequent `# Heading` opens a Section. A small fixed vocabulary of titles (`Fun Facts`, `I Like`, `I Dream Of`, `Websites from People I Admire`) gets specific styling; other titles render with the default. Content lives in `src/data/about.ts`.
_Avoid_: Heading, block, chunk, paragraph
