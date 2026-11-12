---
name: remote-job-hunt-mx
description: >-
  Score public remote-job postings for someone based in Mexico and draft
  materials without sending them. Use when the user is hunting remote roles,
  comparing MXN and USD offers, choosing nómina versus contract work, or
  deciding whether a posting is worth a real application.
---

# Remote job hunt (Mexico)

Search and draft. The user applies. One posting at a time unless they asked for a batch.

For CV bullets, follow `skills/ats-cv-tailor/SKILL.md` after this skill has scored the posting. Do not invent experience while scoring.

`README.md` in this folder is a fictional score for people. The inputs are `examples/synthetic-posting.md` and `examples/synthetic-constraints.md`. Do not treat that pay line as a real offer.

## Hard stops

1. Public pages only. Do not scrape sites that require login, bypass access controls, or collect private profiles, emails, or phone numbers. Do not build or use a contact list.
2. Do not submit a form, send an email, message a recruiter, or schedule a call. Draft only.
3. Do not invent salary, seniority, visa status, or location. If the posting hides pay, say the pay is unknown and ask what the user will accept.
4. Do not tell the user to raise or cut their pay to get through a filter.
5. Do not mark a row "sent" unless the user says they sent it.

## Inputs

Collect these before searching. If any are missing, ask once, in one list, then wait.

- One target title.
- Stack they can explain in an interview. Tools they have not used stay off the list.
- Seniority they will actually claim.
- Contract shapes they will sign: nómina with a Mexican employer, contractor invoice, employer of record, or any.
- Pay floor, as they stated it: MXN per month or USD per month, and whether that figure is gross. This number is theirs. Do not "improve" it.
- English: read, write, speak, in their words.
- Where they can work ("anywhere in Mexico" is fine) and overlap hours they will keep. Clock times in `America/Mexico_City` unless they name another zone.
- Deal-breakers: on-call, weekends, relocation, unpaid equipment, a fee to apply.

## Where to look

The user opens the page or pastes the text. Suggest public sources, then stop:

- The company's own career page.
- OCC, Computrabajo, Get on Board, and LinkedIn's public job search.
- Remote boards they already use (for example We Work Remotely, Remote OK, Himalayas), public listings only.

Skip paid email databases, recruiter exports, and anything behind a login they did not paste themselves. If a result is only visible logged in, ask them to paste the text. Do not log in.

## Score the posting

Score each line 0 or 2. Then one recommendation: apply, maybe, or skip.

| Check | 0 | 2 |
| --- | --- | --- |
| Role | Title or stack is a different job | Title and stack match what they can defend |
| Location | Relocation, or a country they are not in, is required | Mexico, LATAM, or worldwide, and remote |
| Pay | Below their floor, unpaid, or equity-only after they rejected that | Meets the floor, or the written range does |
| Contract | A shape they will not sign | A shape they named |
| Hours | Overlap they cannot keep | Overlap fits |
| Red flags | Fee to apply, training repayment, bank details or ID before an interview | None of those |

Pay with no number is not a 2. Write "unknown" and do not guess a band.

Recommendation:

- **skip** — any red flag, or two or more zeros on role, location, pay, contract.
- **maybe** — one zero, or pay unknown but the rest fits. Say what must be true before they apply.
- **apply** — all six are 2, and they still read the draft before sending.

## Reply shape

For each posting:

1. Recommendation and the six scores.
2. Facts copied from the posting: company, title, location line, pay line verbatim, contract line, overlap line. If a line is missing, write "not stated."
3. Gaps: requirements they have not claimed. These stay out of the draft.
4. A draft they can edit: at most 6 lines of intro, then 4 bullets. Every bullet maps to something they already said they did. No metrics they did not give.
5. Questions to ask before applying: pay if missing, nómina vs invoice vs employer of record, who provides equipment, required overlap.

End with: "Send this, edit it, or drop it?"

## Salary

- Repeat the posting's pay line verbatim. A range is a range. Do not collapse it to the top and call that the offer.
- Convert currencies only when the user supplies the rate. Show the rate and the date they gave. Do not present a converted figure as take-home.
- Do not compute ISR or IMSS. Gross stays gross. Nómina, RESICO, and actividad empresarial change take-home; tell them to check with their accountant if they ask which régimen pays more.
- If the draft needs a number, use the floor they gave. Do not raise it to a guessed band and do not lower it to look cheap.

## Log

Keep a list they can paste into a sheet:

```text
date | company | title | url | pay as written | recommendation | status
```

Status is `drafted`, `user sent`, or `user skipped`. Only the user can move a row to `user sent`.
