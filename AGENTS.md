# AGENTS.md

## Agent skills

### Issue tracker

Tickets live in Jira project `CAM` under Research Project `CAM-1027` (label `SWOTViz`), via the `acli` CLI; GitHub is for PRs only. Branch off `develop` as `<KEY>-<short-description>`; branching, PRs, and `acli` usage: see `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`) applied as Jira labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Testing

When working on the About page (`AboutView.vue`, `about_page.md`), verify the change by adding to or extending the committed tests, then run them; ad-hoc verification scripts leave the next story nothing to re-run. Unit tests (`npm test`, Vitest + jsdom) go in `frontend/src/**/__tests__/`; anything that depends on layout (widths, scrolling, positions) goes in the Playwright browser tests in `frontend/e2e/` (`npm run test:e2e`), because jsdom does no layout. Setup and options: `frontend/README.md`.
