# SWOTViz

SWOTViz is a web viewer for SWOT river and lake observations. Users select features on a map and explore their time series and long profiles.

## Language

### Observations

**Quality Flag**:
SWOT's summary quality indicator for a single reach, node, or lake observation, taking one of four Quality Levels.
_Avoid_: Data quality parameter, q (the `_q` suffix is ambiguous; see **Discharge**)

**Quality Level**:
One of the four ordered values of a Quality Flag: **good** (0), **suspect** (1), **degraded** (2), **bad** (3).
_Avoid_: nominal (SWOT's name for level 0)

**Discharge**:
The SWORD of Science (SoS) consensus estimate of river flow for a reach, matched to SWOT observation times. Discharge has no Quality Flag of its own.
_Avoid_: Streamflow, Q, reanalysis discharge

### Charts

**Long Profile**:
A chart of node observations plotted against distance along the river, with one series per observation date.
_Avoid_: Distance chart, node chart
