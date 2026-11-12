# Remote job hunt (Mexico)

Score one public remote posting for someone based in Mexico, then draft a note and stop. The person sends the application.

The company, the candidate, and the pay figures in the example are fictional. They are not a real offer and not anyone's salary.

## Who it is for

For someone running a bot who wants a written procedure for a remote search from Mexico. It is not a job board, and it does not send applications.

## How to use it

Copy the procedure unchanged:

```text
skills/remote-job-hunt-mx/SKILL.md
  →  <your-bot>/bot/skills/remote-job-hunt-mx/SKILL.md
```

The bot follows `SKILL.md`. This file is the note for people. When the next step is CV bullets, also copy `skills/ats-cv-tailor/SKILL.md`. `bot-template.md` in the repository root walks through a first session.

## Example

Fictional. Northline Analytics is not a real company. The full posting is `examples/synthetic-posting.md`. The constraints are `examples/synthetic-constraints.md`.

Constraints the candidate stated:

- Title: backend engineer
- Stack: Node.js, HTTP APIs, PostgreSQL, AWS
- Years: 4
- Contracts: employer of record, contractor invoice
- Pay floor: USD 3000 per month gross
- Where: anywhere in Mexico
- Overlap: 09:00-18:00 America/Mexico_City

Lines copied from the fictional posting:

- Company: Northline Analytics (fictional)
- Title: Backend engineer
- Location: Remote from anywhere in Mexico.
- Pay, as written: USD 3,000–4,200 / month gross
- Contract: employer of record or the contractor's invoice
- Overlap: 10:00-15:00 America/Mexico_City

Each check is 0 or 2. On this fictional case the six checks are role 2, location 2, pay 2, contract 2, hours 2, and red flags 2. The recommendation is apply. The draft still has to be read before anyone sends it. The log status stays `drafted` until the person says they sent it.

SQS and Terraform stay out of the draft. The sample says the candidate did not use them. The pay line stays the range. It is not rewritten as a single figure at the top of the range.

## What it does not do

It does not submit a form, send an email, message a recruiter, or invent a salary band. If the posting has no number, the pay score is unknown. It does not compute ISR or IMSS, and it does not scrape logged-in boards or contact lists.

## License

MIT. Copyright (c) 2026 Edgar Flores. See the repository `LICENSE`.
