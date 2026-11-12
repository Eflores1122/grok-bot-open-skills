---
name: portfolio-github-polish
description: >-
  Edit a public GitHub profile and portfolio READMEs so a stranger can see the
  role, two real projects, and how to run them. Use when the user wants profile
  copy, pinned repos, or a portfolio page cleaned up for a job search.
---

# Portfolio and GitHub polish

Make the public profile understandable. Do not make it louder.

This skill does not search jobs. For postings and applications, use `skills/remote-job-hunt-mx/SKILL.md`. For CV bullets, use `skills/ats-cv-tailor/SKILL.md`.

`README.md` in this folder shows the outline on a fictional repository. Do not invent stars, users, or a phone number for a real profile.

## Hard stops

- Do not invent stars, forks, downloads, users, or "used by" logos.
- Do not paste private repo contents, secrets, `.env` values, tokens, customer data, or commit text that names a client under NDA.
- Do not rewrite history on a branch other people use. If a secret is in history, point them at GitHub's documentation for removing sensitive data and tell them to rotate the credential. Do not repeat the secret in the reply.
- Do not scrape other profiles for README text, emails, or contribution graphs.
- Do not suggest a phone number or home address on the public profile.

## Done

A stranger, looking only at the public profile, can answer:

1. What role this person wants.
2. Which two projects to open.
3. What those projects do, and what they do not do.

## Profile

- Bio: role, "Mexico" (or the city they asked to show), one stack line. Add one Spanish sentence only if they want recruiters who read Spanish first. No badge walls.
- Pin two to four repos a stranger can clone. Unpin forks unless the fork has their commits and a README that says what they changed.
- Contact: a site or a form they chose. Nothing else.

## README for each pin

Use this order:

1. One sentence on what it does. If it is a tutorial clone, say that in this sentence.
2. Who it is for.
3. A screenshot or sample output only if they already have one. Do not draw a fake product UI and caption it as the app.
4. How to run it, with commands that exist in the repo.
5. What they built and what they left out.
6. Stack, taken from the lockfile, imports, or Dockerfile they have. Do not add tools they only plan to learn.
7. License.

## Portfolio page

One repo or site that links the pins. For each project: the problem, what they built, one tradeoff, the link. Three projects is enough. A thin fourth project makes the page worse; leave it off and say why.

Write the page in English by default. If they are applying in Mexico and want a Spanish lead, add one short Spanish paragraph at the top. Do not translate the whole page into stiff Spanish.

## Checks

- No secrets in the tree they are about to push. Tell them to search for key material and `.env` files. Do not print matches that look like secrets; name the file and the line.
- The default branch README renders.
- They ran the clone steps, or they tell you they did. Do not claim you ran them.
- A license file exists on repos they are showing off.
- No "led a team of N" unless that work is visible in the repo or they documented it elsewhere and you are only linking it.

## Reply shape

A punch list: file, change, why. Then the README text for the one repo they asked about.

Do not open pull requests or push unless they asked for that in this conversation.
