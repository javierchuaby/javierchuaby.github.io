# Skill prominence is a subjective display weight, not a proficiency claim

The 1–5 number on each Skill (renamed from `competency` to `prominence`) controls only display size on the resume page (5 → large, 4 → medium, ≤3 → small) and within-category sort order; the rubric for picking a value is deliberately subjective ("vibes"). It is explicitly not a proficiency, mastery, or experience claim — the glossary refuses to legitimise a calibrated scale because none exists, and the site owner is comfortable with subjective ratings driving display but not with implying calibrated proficiency. The field rename and the removal of "proficiency X out of 5" wording from the `SkillTag` aria-label exist to stop the number being read as a self-assessed skill level by recruiters or future contributors.

## Considered Options

Each of the following calibrated rubrics for what a 5 would mean was rejected:

- **(a) "Mastered"** — a 5 means could give a meetup talk on the topic or interview confidently. Rejected: would not honestly survive the current 14 5/5 ratings (PyTorch, LangGraph, etc.) without over-claiming.
- **(b) "Fluent for substantive work"** — a 5 means shipped non-trivial things in it. Rejected for the same reason as (a).
- **(c) "Familiar"** — a 5 means knows their way around. Rejected as too low to justify a top rating on flagship technologies.
- **(d) "Years of exposure"** mapped to 1–5. Rejected as artificial — years don't track the thing the number is actually doing (visual emphasis).
- **(e) Vibes, explicitly disclaimed as not-a-proficiency-claim** — accepted, paired with the `competency` → `prominence` rename so the field name stops misleading.

A future contributor tempted to reintroduce a calibrated rubric should read this ADR first: the calibrated framing was considered and deliberately rejected, not overlooked.
