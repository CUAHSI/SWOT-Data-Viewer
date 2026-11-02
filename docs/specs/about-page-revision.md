# Spec: Revise the SWOTViz About page

- **Jira:** Epic [CAM-1505](https://cuahsi.atlassian.net/browse/CAM-1505) under Objective `CAM-93` (SWOT - Software support and maintenance), label `SWOTViz`
- **Status:** Draft, agreed in design session 2026-11-02
- **Files in scope:** `frontend/src/assets/about_page.md`, `frontend/src/views/AboutView.vue`, new `frontend/src/assets/team/`

## Problem

The About page (`/about`) is hard to read and partly out of date:

1. **Presentation.** Body text is too large, and on narrow screens text wraps badly and content overflows horizontally. The Table of Contents (TOC) sidebar sits beside the content at every width. Layout is done with inline-styled HTML inside the markdown, so sections look inconsistent.
2. **Project team.** The roster is out of date (Devin Cowan has left, Zahraa Alhmood has joined, titles have changed), and two headshots (Durand, Yadav) are hotlinked from osu.edu and now return 404.
3. **Discharge.** The page never explains the discharge data SWOTViz displays, or that discharge appears only when the **Time Range** overlaps the discharge product's period. The default Time Range is the last 3 months, which falls outside the Version 3 product (launch to 2025-05-02), so users see no discharge by default.
4. **Stale content.** Six product-document links are pre-signed CloudFront URLs that expired in Oct 2024 (they return 403). The mission paragraph says the science phase is "expected to continue through 2025". "Scientific Use-Case Examples" says "Jupyter Notebook examples will be added soon!" although notebooks now exist.

## Goals

- A clean, consistent, readable About page that works down to a 360px-wide phone.
- An accurate project team, with headshots that can't break because of third-party link rot.
- A clear explanation of SWOTViz discharge, including the Time Range caveat.
- No broken links or obviously stale statements.

## Non-goals

- Converting the page to Vuetify components or moving content out of markdown. `about_page.md` remains the single content source.
- Changing the Notebooks page, the discharge data pipeline, or the default Time Range.
- Rewriting sections not named below.

## Decisions

| #   | Decision                                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Keep `about_page.md` as the only content source and keep the auto-generated TOC. Replace inline `style="..."` attributes with a small set of classes styled in `AboutView.vue`.                          |
| D2  | Below ~960px, the TOC moves above the content as a collapsible "Contents" panel. Minimum supported width: 360px.                                                                                          |
| D3  | Team headshots are stored in the repo (`frontend/src/assets/team/`), not hotlinked.                                                                                                                      |
| D4  | Team = six current members as cards, plus a one-line "Former contributors: Devin Cowan". Emails are `mailto:` links.                                                                                     |
| D5  | The discharge text goes in the plot list (full text) and the variables table (one-sentence description), not in a separate section.                                                                      |
| D6  | The SWOT Background sentence about `dschg_c`/`dschg_g` stays, because it describes the official SWOT L2 product. A new sentence explains that SWOTViz provides `sos_consensus_q` instead.                |
| D7  | "Scientific Use-Case Examples" stays. It lists the notebooks in the Notebooks page's HydroShare collection, then links to the in-app Notebooks page for the current list.                                 |

Use the vocabulary in `GLOSSARY.md` (**Discharge**, **Time Range**, **Quality Flag**, **Long Profile**). Write "SWOTViz", not "SWOT Viz" or "SWOTVis".

## Stories

Story 1 blocks Stories 2-4, because it sets the markup conventions the other stories use. Stories 2-4 are independent of each other but all edit `about_page.md`, so expect small merge conflicts if they run in parallel.

### Story 1 (CAM-1506): About page layout and typography

**Scope:** `AboutView.vue` styles and TOC; markup conventions in `about_page.md`. No content changes.

- Replace every inline `style="..."` attribute in `about_page.md` with classes (suggested: `callout`, `plot-cards`, `plot-card`, `team-grid`, `team-card`, `partners`), styled in `AboutView.vue`.
- Reduce body text to ~15px and scale headings to match.
- Prevent horizontal overflow:
  - the variables table scrolls horizontally inside its own container;
  - long URLs and identifiers wrap (`overflow-wrap: anywhere`);
  - images never exceed the content width (`max-width: 100%; height: auto`), overriding the fixed `width`/`height` attributes in the markdown.
- Plot cards and the partners block stack vertically on narrow screens.
- TOC: at ≥960px, keep the sticky sidebar with a sensible fixed width (the current `width: 1200px` on a flex child is a bug). Below 960px, render it above the content as a collapsible "Contents" panel, collapsed by default.
- Remove the `---` horizontal rule after each `##` heading; style section separation in CSS instead.

**Acceptance criteria**

- At 360px, 768px, and 1440px widths, the page has no horizontal page scroll; only the variables table scrolls sideways.
- No `style=` attributes remain in `about_page.md`.
- TOC links still scroll to their sections at all widths.
- `npm run lint-format` passes in `frontend/`.

### Story 2 (CAM-1507): Update the project team

**Scope:** "SWOTViz Project Team" section; `frontend/src/assets/team/`.

Team cards, in this order:

| Name                | Title                                  | Organization            | Email                   | Headshot source (verified 2026-11-02)                                                                                                                       |
| ------------------- | -------------------------------------- | ----------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anthony Castronova  | Lead of Research                       | CUAHSI                  | acastronova@cuahsi.org  | https://www.cuahsi.org/uploads/team/img/_headshot/TCastronova.jpg                                                                                           |
| Irene Garousi-Nejad | Research Scientist                     | CUAHSI                  | igarousi@cuahsi.org     | https://www.cuahsi.org/uploads/team/img/_headshot/Irene_headshot03.jpg                                                                                      |
| Martin Seul         | Lead of Software Engineering (acting)  | CUAHSI                  | mseul@cuahsi.org        | https://www.cuahsi.org/uploads/team/img/_headshot/Martin.jpg                                                                                                |
| Zahraa Alhmood      | Research Software Developer            | CUAHSI                  | zalhmood@cuahsi.org     | https://www.cuahsi.org/uploads/team/img/_headshot/34937c8b-e306-4f43-bff6-651ae5e07af0.jpg                                                                  |
| Michael Durand      | Professor                              | Ohio State University   | durand.8@osu.edu        | https://earthsciences.osu.edu/sites/default/files/styles/people_profile_image/public/pictures/2024-01/durand_photo_2.jpg.webp?h=29a016df&itok=Fy5NFv1o      |
| Bidhyananda Yadav   | Research Associate                     | Ohio State University   | yadav.111@osu.edu       | https://byrd.osu.edu/sites/default/files/pictures/2021-05/bidhya-yadav.jpg (orphaned upload; download it promptly)                                          |

- Download each headshot into `frontend/src/assets/team/` with a consistent naming scheme (e.g. `castronova.jpg`), crop or resize to a consistent square-ish size (~240px), and reference them so Vite bundles them.
- Render each person as a `team-card` (photo, name, title, organization, `mailto:` email) in a responsive `team-grid` (one column at 360px, 2-3 at desktop). Use semantic markup, not `<h3>` for titles and emails (also fixes the malformed `<h34>` tag).
- After the grid, add: "Former contributors: Devin Cowan".

**Acceptance criteria**

- Six cards with the data above; Devin Cowan appears only in the former-contributors line.
- No team image is loaded from a third-party host.
- Emails open the mail client.

### Story 3 (CAM-1508): Explain SWOTViz discharge

**Scope:** "SWOT Background", "What types of plots does SWOTViz provide?", and "Which variables are used for plots in SWOTViz?".

1. In the plot bullet list, add an item. It is the supplied text with three edits: "SWOT Viz" → "SWOTViz", the URL becomes a link, and the "Time Range" quotes are made consistent.

   > **Consensus discharge vs. time:** The SWOTViz app displays SWOT Level 4 River Discharge, created by the Science Team Discharge Algorithm Working Group, version 3, as described [here](https://www.earthdata.nasa.gov/data/alerts-outages/swot-level-4-sword-science-river-discharge-products-version-3-released). Version 3 discharge was released in January 2026, and spans the period from launch to May 2, 2025. SWOTViz displays the Consensus discharge product. Note that SWOTViz will not display discharge unless the "Time Range" is set appropriately. Please see the link above for additional details about the discharge product.

2. In the variables table, add a row:

   | Aggregation Level | Variable Code     | Variable Long Name  | Description                                                                                                                                          | Unit |
   | ----------------- | ----------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
   | Reach             | _sos_consensus_q_ | Consensus discharge | SWOT Level 4 SWORD of Science (SoS) Consensus discharge, version 3, matched to SWOT reach observation times. Available for reaches only, not nodes or lakes. | m³/s |

3. In SWOT Background, keep the existing sentence that lists `dschg_c` and `dschg_g`. Immediately after it, add a sentence along the lines of: "SWOTViz does not plot these Level 2 discharge fields; instead it provides the SWOT Level 4 SoS Consensus discharge (`sos_consensus_q`), described in *Which variables are used for plots in SWOTViz?*" Make the section name a working link to that heading.

**Acceptance criteria**

- The discharge text appears in the plot list as above, and `sos_consensus_q` appears in the table.
- The SWOT Background paragraph distinguishes the L2 discharge from what SWOTViz displays.
- The existing "What does data quality mean?" discharge paragraph is unchanged and consistent with the new text.

### Story 4 (CAM-1509): Refresh stale content and add notebook examples

**Scope:** expired links, mission dates, "Scientific Use-Case Examples".

- Replace all six expired pre-signed links (they contain `Expires=`) with stable URLs, preferably PO.DAAC dataset or documentation landing pages:
  - SWOT Background: "SWOT River Vector Product Description"
  - Variables section: L2 river and L2 lake product description links
  - Product description: SWOT Data User Handbook; L2 Lake and L2 River single-pass vector product descriptions
- Also check the other links in "Other Useful Resources" (e.g. the `SWOT_L2_HR_*_2.0` dataset pages) and update any that are broken or point at superseded versions.
- Update the mission sentence "expected to continue through 2025" using a current source (https://swot.jpl.nasa.gov/mission/overview/).
- Replace "Jupyter Notebook examples will be added soon!" with the notebooks in HydroShare collection `ac6cc75dcb0146cf9cc17a974f4bb08b` (the collection the Notebooks page uses). Each entry: title linked to HydroShare, authors, and a one-sentence description drawn from the resource abstract. As of 2026-11-02:
  - [Visualizing SWOT Discharge Data from the SWORD of Science (SoS) Dataset](http://www.hydroshare.org/resource/cdae2ab2435c4baa999c1dca091073ab), Castronova and Garousi-Nejad (2026)
  - [Visualizing SWOT River Longitudinal Profiles for Water Resources](http://www.hydroshare.org/resource/1e5dff3ab72440d2a4e3942326ada5a4), Durand and Yadav (2026)
  - [Validating SWORD of Science (SoS) Discharge Estimates with Hydrology Community Discharge Streamflow Observations (SWOT SHCQ)](http://www.hydroshare.org/resource/1cc0fdda275340ff9d6682627d09a3b9), Castronova and Garousi-Nejad (2026)
- End the section with a link to the in-app Notebooks page (`/notebooks`) for the full, current list.

**Acceptance criteria**

- `about_page.md` contains no `Expires=` URLs, and every external link returns 2xx.
- The notebooks section lists the three resources with descriptions and links to `/notebooks`.

## Notes for implementers

- The About page renders `about_page.md` with `marked` and builds the TOC from `<h2>` headings (`AboutView.vue`). Keep `##` for top-level sections so the TOC keeps working.
- Minor typos in the page ("evelation", "stydying", "SWOTVis-logo" alt text) may be fixed opportunistically in whichever story touches those lines.
