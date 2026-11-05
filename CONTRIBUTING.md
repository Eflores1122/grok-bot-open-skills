# Contributing

Additions are welcome as pull requests. Keep a skill generic. This repository is a public template, not someone's job search.

## Add or edit a skill

1. One folder under `skills/`. The folder name is the `name` in the frontmatter.
2. The file is `skills/<name>/SKILL.md`.
3. Frontmatter has `name` and `description` only. The description says what the skill does and when to use it.
4. The body is a procedure: inputs, hard stops, steps, and the shape of the reply. Write it so a bot can follow it without extra commentary.
5. Point at another skill by path when the work belongs there. Do not copy the whole procedure into a second file.

## Examples

- Put samples in `examples/`.
- Mark them synthetic in the first lines.
- Use fictional employers and a nameless candidate. No real names, emails, phones, addresses, CURP, RFC, or client names.

## What not to add

- Steps for scraping logged-in sites, bypassing access controls, or collecting private contact details.
- Instructions to submit an application, message a recruiter, or mark an application sent without the user saying they did it.
- Advice to invent or inflate salary, title, dates, or tools.
- Personal data, even "just as an example."
- A claim that this pack is an official Cursor, xAI, or Grok product.

## License

By opening a pull request you agree that your contribution is under the MIT license in `LICENSE` (Copyright (c) 2026 Edgar Flores). Dataset files do not belong in this repo. A skill may tell the user to record a publisher's license; that license stays the publisher's.
