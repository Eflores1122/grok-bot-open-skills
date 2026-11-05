# Job-hunt teammate, from the skill

A short guide to a bot that helps you run a remote search from Mexico. The bot prepares. You apply.

This is not a Cursor product and it is not affiliated with Cursor or xAI. It assumes a bot that loads on-demand procedures from `bot/skills/<name>/SKILL.md` (the layout used by the Agent SDK). If yours loads skills from somewhere else, use that path and keep the file as it is.

## What you get

A teammate you can paste postings to. It asks for your constraints, scores the posting, and drafts a note. It does not open the employer's form, send email, or tell you that you applied.

## 1. Start from a bot you already run

You need a bot with:

- `bot/agent.ts` (or the entry file your runtime already uses)
- `bot/instructions.md`

Leave the model and hosting you already use. This pack does not pick one.

## 2. Copy the skills

```text
skills/remote-job-hunt-mx/SKILL.md
  →  bot/skills/remote-job-hunt-mx/SKILL.md

skills/ats-cv-tailor/SKILL.md
  →  bot/skills/ats-cv-tailor/SKILL.md
```

Copy the folders. Do not merge them into `instructions.md`. The job-hunt skill scores and drafts. The CV skill rewrites bullets. Load the second one when you paste a CV.

## 3. Keep instructions short

`bot/instructions.md` is identity and stops. The skill is the procedure. A starting point you can edit:

```markdown
You are a job-search teammate for someone based in Mexico.
You prepare a remote search. The user sends every application.

When the user is choosing roles, pastes a posting, or asks what to do next,
follow skills/remote-job-hunt-mx/SKILL.md.

When the user pastes a CV or asks for bullets, follow skills/ats-cv-tailor/SKILL.md.

Stops:
- Do not scrape private profiles, logged-in boards, or contact lists.
- Do not submit, email, or schedule anything.
- Do not invent salary, employers, dates, degrees, or tools.
- Quote pay as written. If the posting has no number, say unknown.
- Ask for missing constraints in one list, then wait.
- Mark an application sent only after the user says they sent it.
```

## 4. Skip tools on the first version

V1 input is text the user pastes: the posting and, if they want a CV pass, the CV. That keeps the bot off sites it should not log into.

Add a fetch later only for a public URL the user named, and only if the page is public without a login. Do not add a tool that finds emails, phones, or "decision makers."

## 5. Put it where you will actually talk to it

The local playground or HTTP endpoint is enough to test. A chat channel you already use (Slack, for example) is what makes it feel like a teammate. The channel does not get permission to apply.

## 6. How a session goes

1. You send one target title, the stack you can defend, the contract shapes you will sign (nómina in Mexico, contractor invoice, employer of record), your pay floor, your English level, and the hours you will overlap. Use `America/Mexico_City` when you mean central Mexico.
2. You paste one posting, or a public URL you are allowed to open.
3. The bot returns scores, gaps, a draft, and questions for the employer.
4. You edit the draft. You apply on the employer's site yourself.
5. You tell the bot "I sent it" or "I skipped it" so the log matches what happened.

Salary in that session is either the line from the posting or the floor you stated. The bot does not pick the top of a range and call it your number.

## 7. Test it on the fake posting

Paste `examples/synthetic-posting.md` and ask for a score and a bullet rewrite.

Pass looks like this:

- Terraform and SQS stay off the CV, because the candidate never used them.
- The pay line is quoted as USD 3,000–4,200 / month gross, not rewritten as a single "offer."
- Nothing is marked submitted.

Fail looks like this:

- A metric, employer, or tool appears that the sample did not state.
- The draft uses 4,200 because it is the top of the range.
- The bot offers to email the company or says the application is in.

When that check passes, use your own posting next. One posting per turn until you trust the stops.
