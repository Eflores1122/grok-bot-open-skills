---
name: ats-cv-tailor
description: >-
  Rewrite CV bullets so a plain-text ATS can parse them and the wording matches
  a posting, using only experience the user already stated. Use when the user
  pastes a job post and a CV, asks for keyword alignment, or wants bullets
  rewritten for a specific role.
---

# ATS CV tailor

Match the posting with evidence the user already has. A tailored CV is a reordering and a rephrase, not a new career.

Pair with `skills/remote-job-hunt-mx/SKILL.md` when they also want a score and a cover note. This skill does not decide whether they should apply, and it does not submit anything.

`examples/synthetic-posting.md` shows the output shape on fictional input. Do not copy those bullets onto a real person.

## Hard stops

- Do not add employers, titles, dates, degrees, certifications, or tools the user did not provide.
- Do not invent metrics. If they gave no number, the bullet has no number.
- Do not close a gap by moving dates.
- A keyword goes in only if they can explain it out loud. If they cannot, list it under "do not claim."
- Do not tell them to lie about salary, visa, or location if the posting asks and the CV would carry the answer.

## Read the posting

Pull these out as quotes, not paraphrases:

- Exact title.
- Must-have skills and years.
- Nice-to-have skills.
- Domain words (industry, compliance, scale).
- Seniority signals ("lead", "own", a year count).

## Read the CV

For each must-have, find a line they wrote: where, how long, what they did. No line means "do not claim." Nice-to-haves follow the same rule.

## Rewrite rules

- Stay inside the length they already use. Do not pad a one-page CV to two pages.
- Plain headings: Summary, Experience, Education, Skills. No tables, text boxes, icons, columns, or headers and footers full of keywords.
- Tell them to export `.docx` or a single-column PDF from that text. Do not emit a binary.
- Bullet shape: verb, what they built or ran, the scope they stated, the result they stated.
- Use the posting's word when their CV already supports it. Do not upgrade "a database table we polled" to a product they did not run.
- Summary: three lines. The title they are applying for, the years they stated, two proofs from the CV. No "passionate", "results-driven", or "dynamic."
- Skills line: evidenced terms only. Order the ones the posting named first. Drop the rest from this version of the CV if space is tight; do not delete them from the master CV without saying so.

## Reply shape

1. Keyword table: posting term, quote from their CV, `use` or `drop`.
2. Rewritten summary.
3. Bullets they asked to change, as old → new. Leave unmentioned roles alone and say you left them alone.
4. Skills line for this application.
5. "Left out on purpose", with the reason for each item (no evidence, or nice-to-have they did not use).

If the posting's must-haves are mostly drops, say so in one line at the top. Do not paper over a mismatch with synonyms.
