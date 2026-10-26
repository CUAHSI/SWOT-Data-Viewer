# Issue tracker: Jira (CAM)

Tickets and specs for this repo live in Jira, project `CAM`, on `cuahsi.atlassian.net`. Use the Atlassian CLI (`acli`) for all operations. GitHub (`CUAHSI/SWOT-Data-Viewer`) is used **only for pull requests**; never create GitHub issues.

`CAM` is shared by every Compute and Modeling team project. Only touch work items under the SWOT tree below.

Prefix every `acli` command with `PAGER=cat` (or `export PAGER=cat`), otherwise output opens in an interactive pager and hangs.

## Hierarchy

```
CAM-1027  Research Project   SWOT Viz Research Project
├── CAM-91  Objective        SWOT - Develop a cloud application for accessing swot measurements
├── CAM-92  Objective        SWOT - Provide community support for working with SWOT observations
└── CAM-93  Objective        SWOT - Software support and maintenance
    └── Epic                 bundles related Stories; 1 week to 3 months of work
        └── Story            smallest unit agents create
            └── Sub-task     (created by humans; agents don't create these)
```

- **Story** is the smallest unit to create. Every Story has an Epic as its parent.
- Create an **Epic** only when bundling several related Stories that together take 1 week to 3 months. Its parent is the matching Objective (`CAM-91`/`92`/`93`).
- Never create Research Projects, Objectives, or Sub-tasks.
- Every work item gets the label `SWOTViz`.
- Order backlogs by Rank: `ORDER BY cf[10116] ASC` (`customfield_10116`).
- Statuses: `To Do`, `Up Next`, `In Progress`, `In Review`, `Done`, `Won't Do`.

## Conventions

- **Create a Story**: `acli jira workitem create --project CAM --type Story --parent <EPIC-KEY> --label SWOTViz --summary "..." --description-file <file>`. Write the body to a temp file for multi-line descriptions. Plain text only: Jira does not render Markdown (use ADF JSON if rich formatting matters).
- **Create an Epic**: same as above with `--type Epic --parent CAM-91|CAM-92|CAM-93`.
- **Read a work item**: `acli jira workitem view <KEY> --fields "summary,issuetype,status,parent,labels,description,comment" --json`.
- **Read comments**: `acli jira workitem comment list --key <KEY>`.
- **List SWOT work**: `acli jira workitem search --jql "project = CAM AND labels = SWOTViz AND statusCategory != Done ORDER BY cf[10116] ASC" --fields "key,issuetype,summary,status,labels" --csv`. Narrow with `AND parent = <EPIC-KEY>`, `AND labels = ready-for-agent`, `AND issuetype = Story`, etc.
- **Comment**: `acli jira workitem comment create --key <KEY> --body "..."` (or `--body-file <file>`).
- **Apply / remove labels**: `acli jira workitem edit --key <KEY> --labels "..." --yes` / `--remove-labels "..." --yes`. Labels are created on first use.
- **Change status**: `acli jira workitem transition --key <KEY> --status "In Progress" --yes`.
- **Close**: comment with the reason, then transition to `Done` (resolved) or `Won't Do` (declined).
- **Link**: `acli jira workitem link create --out <BLOCKER> --in <BLOCKED> --type Blocks --yes`. Other types: `Relates`, `Duplicate`. List with `acli jira workitem link list --key <KEY> --json`.

## Pull requests (GitHub)

PRs are opened on GitHub with `gh pr create`. Put the Jira key in the branch name and PR title (e.g. `CAM-1448-streamflow-plot`, `CAM-1448: Add streamflow data to the plot page`) so the PR can be traced back to its Story. When a PR is opened for a Story, transition the Story to `In Review`.

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_ When `yes`, triage external PRs with `gh pr view <n> --comments`, `gh pr diff <n>`, `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, and `gh pr close`.

## When a skill says "publish to the issue tracker"

Create a Jira Story under the relevant Epic (or an Epic under the relevant Objective, if it's a multi-Story body of work), labelled `SWOTViz`. If no Epic clearly fits, ask the user which one to use rather than guessing.

## When a skill says "fetch the relevant ticket"

Read it as in **Read a work item** above. A bare `#42` refers to a GitHub PR; a `CAM-123` key refers to Jira.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single Epic with **child** Stories as tickets.

- **Map**: an Epic under the relevant Objective, labelled `SWOTViz,wayfinder:map`, holding the Notes / Decisions-so-far / Fog body.
- **Child ticket**: a Story with `--parent <map-epic>`, labelled `SWOTViz,wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, it's assigned to the driving dev.
- **Blocking**: a `Blocks` link (`--out <blocker> --in <blocked>`). A ticket is unblocked when every inward `Blocks` link points at an item in `Done` or `Won't Do`.
- **Frontier query**: `acli jira workitem search --jql "parent = <map> AND statusCategory != Done AND assignee is EMPTY ORDER BY cf[10116] ASC" --csv`, then drop any with an open blocker (check `acli jira workitem link list --key <KEY> --json`); first in Rank order wins.
- **Claim**: `acli jira workitem assign --key <KEY> --assignee @me --yes`, the session's first write. Then transition to `In Progress`.
- **Resolve**: comment with the answer, transition to `Done`, then append a context pointer (gist + key) to the map Epic's Decisions-so-far.
