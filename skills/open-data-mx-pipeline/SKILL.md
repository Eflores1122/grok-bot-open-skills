---
name: open-data-mx-pipeline
description: >-
  Plan a small, repeatable pipeline over a Mexican public dataset: source,
  raw file, schema, one cleaning pass, one question. Use when the user wants
  to analyze or publish open data from Mexico and needs the download, license,
  and checks spelled out.
---

# Open data pipeline (Mexico)

One public dataset, one question, one table or chart. The code in the user's repo can be MIT. The data stays under the publisher's license.

This skill is not a job-search skill. Do not mix it into CV or outreach drafts.

`README.md` in this folder shows a fictional source block. It is not a citation, and it does not contain a real statistic.

## Hard stops

- Public, documented downloads only. No logins, no captcha bypass, no HTML scraping when the publisher offers a bulk file or a documented API.
- If the file contains personal data (a person's name, CURP, address, phone, or a plate or folio tied to a person), stop. Do not publish a row-level extract. Aggregate, or pick another dataset.
- Establishment-level files (for example INEGI DENUE) list businesses and addresses. Aggregate them to the geography the question needs. Do not republish the microdata.
- Record the publisher's license and attribution. Do not relicense their data as MIT because the pipeline code is MIT.
- Prefer the bulk file. Do not page an API in a loop when the publisher already ships a full extract or documents a rate limit.
- Do not predict. Answer what the file says for the period it covers.

## Sources

The user picks one. Do not browse for them unless they ask you to open a specific public URL.

- [datos.gob.mx](https://www.datos.gob.mx) — federal open-data catalog.
- INEGI — censuses and published indicators, including public BIE tables. DENUE only under the rule above.
- Banco de México SIE — public economic time series.
- CONEVAL — published poverty and social-program tables.
- A state or city catalog that states a license, such as [data.cdmx.gob.mx](https://www.data.cdmx.gob.mx).

If the portal is a map with no download, say so. Do not reverse-engineer tiles.

## Folder

```text
data/raw/       # the download, unmodified
data/interim/   # cleaned file used for the question
README.md       # source, date, license, question
```

Raw stays raw. Cleaning writes a new file.

## Steps

1. Record publisher, dataset title, URL, retrieval date, license name, and the update frequency if the page states it.
2. Download the publisher's file or call the documented API once. Save the raw bytes.
3. Write a schema: column, type, example, how nulls look. Note the geography key (state code or CVEGEO) and the period column.
4. Clean only what blocks the question. Typical fixes: encoding (`utf-8` or `latin-1`), thousand separators, dates, sentinels (`N/D`, `*`, `-1`). Write each rule in the README.
5. State one question the file can answer. A usable shape: "What was the published unemployment rate for Estado de México in the latest quarter in this file?" Not a forecast, and not a rank across sources you did not open.
6. Produce one table or one chart, plus the filter. Round the way the publisher rounds. Spot-check three values against the publisher's own table.
7. Caption: publisher, dataset name, period, retrieval date.

## Before they publish

- The raw file can be fetched again from the URL they wrote down.
- No row is a person, and no establishment list is in the published output.
- Three spot-checked numbers match the publisher.
- The README separates code license and data license.
- The README says the pipeline does not refresh itself.

## Reply shape

Plan first, before code: dataset, question, columns, and what you will not join. Wait for a yes.

Then the README section (source block, cleaning rules, question, caption) and, only for steps they asked to implement, code in the language of their repo.
