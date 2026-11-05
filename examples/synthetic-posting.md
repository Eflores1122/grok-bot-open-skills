# Synthetic posting → tailored bullets

Fictional. Northline Analytics is not a real company. The candidate is not a real person. No email, phone, or address. Do not paste these bullets into a real CV.

This file shows the shape `skills/ats-cv-tailor/SKILL.md` should produce. The pay line is here so a job-hunt pass can be checked against `skills/remote-job-hunt-mx/SKILL.md` at the same time.

## Posting (synthetic)

**Backend engineer — remote, Mexico**
Northline Analytics (fictional)

Remote from anywhere in Mexico. Overlap 10:00–15:00 America/Mexico_City. Contract, monthly, paid through their employer of record or the contractor's invoice.

Pay line, as written: **USD 3,000–4,200 / month gross**.

Must have:

- 3+ years building HTTP APIs
- PostgreSQL
- AWS
- Written English for tickets, and Spanish

Nice to have:

- SQS
- Terraform

## Evidence the candidate stated

- 4 years as a backend developer at a regional logistics company.
- Shipment-status HTTP APIs in Node.js, used by the warehouse app (about 40 internal users).
- PostgreSQL. They changed the shipment tables and wrote the queries those endpoints used.
- AWS: the team's pipeline deployed to ECS and RDS. They ran that pipeline. They did not write Terraform.
- No SQS. Pending work sat in a database table that a worker polled.
- Tickets written in Spanish and English.
- API errors during the shift. Not a 24/7 rotation.
- They did not state a pay floor in this sample.

## Bullets before

- Responsible for backend development and database work.
- Helped with cloud deployments and supported the team.
- Worked with stakeholders to deliver features.

## Keyword table

| Posting term | Evidence they stated | Decision |
| --- | --- | --- |
| HTTP APIs | Shipment-status HTTP APIs in Node.js | use |
| PostgreSQL | Changed shipment tables and wrote the queries | use |
| AWS | Ran the pipeline to ECS and RDS | use |
| 3+ years | 4 years as a backend developer | use |
| Written English, Spanish | Tickets in both | use |
| SQS | No. They polled a database table | drop |
| Terraform | They did not write it | drop |

## Summary (rewritten)

Backend developer applying for the Northline Analytics backend role. Four years building HTTP APIs in Node.js on PostgreSQL, deployed on AWS ECS and RDS. Writes tickets in Spanish and English.

## Bullets after

- Built and maintained the shipment-status HTTP API in Node.js for the warehouse app (about 40 internal users). Data lived in PostgreSQL.
- Changed the shipment tables and wrote the queries those endpoints used. Handled API errors during the shift, not on a 24/7 rotation.
- Ran the team's existing deploy pipeline onto AWS ECS and RDS.

Old "stakeholders" bullet: dropped. They never said what that work was.

## Skills line for this application

Node.js, HTTP APIs, PostgreSQL, AWS (ECS, RDS), Spanish, written English.

## Left out on purpose

- **SQS.** The polling table is not SQS. Naming it SQS would be a false claim.
- **Terraform.** They used a pipeline someone else owned.
- **A latency or uptime figure.** They did not give one.
- **A salary number.** The posting states a range, USD 3,000–4,200 / month gross. That is not an offer at 4,200, and this sample has no floor from the candidate. The draft does not pick a number inside the range.

## What a job-hunt pass should add

Score the posting only after the user supplies a real floor, contract preference, and hours. With those missing, pay is "unknown" against their floor even though the posting has a range. Do not mark the application sent.
