# ATS CV tailor

Rewrite CV bullets so a plain-text ATS can read them and the wording matches one posting, using only experience the person already stated.

The employer and the candidate in the example are fictional. Do not paste the bullets into a real CV.

## Who it is for

For someone who has a posting and a CV and wants the wording aligned, without a new career, new dates, or new tools.

## How to use it

Copy the procedure unchanged:

```text
skills/ats-cv-tailor/SKILL.md
  →  <your-bot>/bot/skills/ats-cv-tailor/SKILL.md
```

The bot follows `SKILL.md`. This file is the note for people. The worked file is `examples/synthetic-posting.md`. For a score and a stop before applying, also copy `skills/remote-job-hunt-mx/SKILL.md`.

## Example

Fictional candidate. Four years as a backend developer at a regional logistics company. That company is not a real employer. They built shipment-status HTTP APIs in Node.js, changed PostgreSQL shipment tables, and ran an existing deploy pipeline to AWS ECS and RDS. They did not write Terraform. Pending work sat in a table a worker polled. That table is not SQS.

Bullet before:

- Responsible for backend development and database work.

Bullet after:

- Built and maintained the shipment-status HTTP API in Node.js for the warehouse app (about 40 internal users). Data lived in PostgreSQL.

Left out on purpose: SQS, Terraform, and any latency or uptime figure, because the candidate did not state them. The posting's pay range is not a number to put on the CV.

The keyword table in `examples/synthetic-posting.md` marks HTTP APIs, PostgreSQL, AWS, years, and languages as `use`, and SQS and Terraform as `drop`.

## What it does not do

It does not add employers, titles, dates, degrees, tools, or metrics the person did not provide. It does not decide whether they should apply, and it does not submit anything.

## License

MIT. Copyright (c) 2026 Edgar Flores. See the repository `LICENSE`.
