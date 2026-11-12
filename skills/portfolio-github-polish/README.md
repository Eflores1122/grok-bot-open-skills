# Portfolio and GitHub polish

Edit a public GitHub profile and the READMEs of pinned repos so a stranger can see the role, two projects, and how to run them.

The repository in the example is fictional. It has no users, no stars, and no production traffic.

## Who it is for

For someone cleaning a public profile before a job search. The procedure does not search jobs and it does not rewrite CV bullets.

## How to use it

Copy the procedure unchanged:

```text
skills/portfolio-github-polish/SKILL.md
  →  <your-bot>/bot/skills/portfolio-github-polish/SKILL.md
```

The bot follows `SKILL.md`. This file is the note for people. For postings, use `skills/remote-job-hunt-mx/SKILL.md`. For CV bullets, use `skills/ats-cv-tailor/SKILL.md`.

## Example

Fictional repository `tide-ledger`. A stranger, looking only at the public profile, should be able to answer three questions: what role this person wants, which two projects to open, and what those projects do.

Sample README order for `tide-ledger`:

1. One sentence: prints a one-line balance from a synthetic CSV. It is a tutorial sample, not a bank.
2. Who it is for: someone learning to read a CSV in Python.
3. Sample output, only because this fictional repo already prints one: `balance 0.00 (synthetic)`.
4. How to run it: the commands that exist in that repo, not commands you wish it had.
5. What it leaves out: it does not connect to a bank or to a payment network.
6. Stack: only libraries that repo already imports.
7. License: the license file in that repo.

The profile bio names a role, "Mexico" or a city the person asked to show, and one stack line. Contact is a site or a form they chose. There is no phone number and no home address.

## What it does not do

It does not invent stars, forks, downloads, users, or logos. It does not paste secrets, `.env` values, tokens, or client names. It does not open pull requests or push unless the person asked in that conversation.

## License

MIT. Copyright (c) 2026 Edgar Flores. See the repository `LICENSE`.
