# grok-bot-open-skills

Procedures for a Grok bot. Each skill is a `SKILL.md` file: YAML frontmatter (`name`, `description`) and a markdown checklist. Copy the file into your bot. The bot follows it when the task matches the description.

This pack covers a remote job search run from Mexico, CV wording, a public GitHub profile, and a small open-data pipeline. It is an independent project by Edgar Flores. It is not affiliated with Cursor, xAI, or the Grok product, and it is not an official skill library.

## Put a skill in a bot

Copy the skill folder unchanged:

```text
skills/remote-job-hunt-mx/SKILL.md
  →  <your-bot>/bot/skills/remote-job-hunt-mx/SKILL.md
```

Do the same for the other folders. The `name` in the frontmatter matches the folder name. If your bot loads skills from another directory, keep the file intact and point the bot at it. Keep one copy, in the skills folder, rather than pasting the whole procedure into the system prompt.

`bot-template.md` walks through turning the job-hunt skill into a teammate that drafts and stops before anything is sent.

## Skills

| Folder | Use it when |
| --- | --- |
| `skills/remote-job-hunt-mx` | You are searching remote roles you can do from Mexico and you want a score, a draft, and a stop before you apply. |
| `skills/ats-cv-tailor` | You have a posting and a CV, and you want bullets rewritten for an ATS without invented history. |
| `skills/portfolio-github-polish` | You want a public GitHub profile and READMEs a stranger can judge in a few minutes. |
| `skills/open-data-mx-pipeline` | You want a small pipeline over a Mexican public dataset, with the license and the raw file kept. |

`examples/synthetic-posting.md` is a fake posting and a bullet rewrite. The company and the candidate are not real. Use it to see the output shape, or to test a bot.

## Rules for use

The skills repeat these. They are here so you see them before you copy anything.

- **Public sources only.** Career pages, job boards, and open-data catalogs you can open without a bypass. No scraping of private profiles, no logged-in portals, no contact lists, no email harvesting.
- **You confirm every application.** The bot drafts the text and a score. You send the application yourself, on the employer's site. The bot does not mark anything sent until you say you sent it.
- **Salary stays honest.** Quote the pay line as the posting wrote it. If there is no number, say unknown. Do not invent a band, do not raise your pay to match a guess, and do not cut your real floor to look cheaper. Take-home depends on your régimen; this pack does not calculate ISR.
- **History stays honest.** No fake employers, dates, degrees, tools, stars, or metrics.

## Layout

```text
bot-template.md
CONTRIBUTING.md
LICENSE
examples/synthetic-posting.md
skills/<name>/SKILL.md
```

MIT. Copyright (c) 2026 Edgar Flores. See `LICENSE`.

## Nota en español

Estos archivos son procedimientos para un bot. No son un producto oficial de Cursor, xAI ni Grok. Copia la carpeta de la skill a `bot/skills/` en tu bot. El bot redacta; tú confirmas cada postulación antes de enviarla. No inventes sueldos, puestos ni años de experiencia. No saques datos de portales privados, perfiles cerrados ni listas de correos.
