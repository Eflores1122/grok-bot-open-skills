# Open data pipeline (Mexico)

Plan one small pipeline over one Mexican public dataset: the source, the raw file, a schema, one cleaning pass, and one question.

The office, the URL, and the table in the example are fictional. They are not a download from INEGI or datos.gob.mx, and the example does not contain a real statistic.

## Who it is for

For someone who wants the download, the publisher's license, and the checks written down before they publish a chart. This is not a job-search skill.

## How to use it

Copy the procedure unchanged:

```text
skills/open-data-mx-pipeline/SKILL.md
  →  <your-bot>/bot/skills/open-data-mx-pipeline/SKILL.md
```

The bot follows `SKILL.md`. This file is the note for people. The procedure plans first and waits for a yes before writing code.

## Example

Fictional publisher. Do not cite this block as a real dataset.

```markdown
## Source

- Publisher: Example State Statistics Office (fictional)
- Title: Sample quarterly labor table
- URL: https://example.invalid/labor/sample.csv
- Retrieval date: 2026-11-01
- Publisher license: CC BY 4.0 (example text only)
- Update frequency: the page does not say
- Question: What was the published unemployment rate for the example state in the latest quarter in this file?
- Person-level rows: no
- Establishment roster: no

The code can be MIT. This data stays under the publisher license. The pipeline does not refresh itself.
```

The question names a rate. The example does not invent the rate. A real pipeline would copy three values from the publisher's own table after the file is downloaded, and it would keep the raw file unmodified under `data/raw/`.

If the file had a person's name, CURP, address, or phone, the procedure stops. It does not publish a row-level extract.

## What it does not do

It does not log in, bypass a captcha, or scrape HTML when a bulk file exists. It does not relicense the publisher's data as MIT, and it does not forecast a number the file does not contain.

## License

MIT. Copyright (c) 2026 Edgar Flores. See the repository `LICENSE`. The publisher's license stays the publisher's.
