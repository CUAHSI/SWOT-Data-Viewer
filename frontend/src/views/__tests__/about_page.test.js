import { describe, it, expect } from 'vitest'
import { marked } from 'marked'
import aboutMarkdown from '@/assets/about_page.md?raw'

const aboutDoc = new DOMParser().parseFromString(marked(aboutMarkdown, { gfm: true }), 'text/html')

// a copy of the elements after a heading, up to the next heading of the same or a higher level
function sectionAfter(text) {
  const heading = Array.from(aboutDoc.querySelectorAll('h2, h3')).find(
    (el) => el.textContent === text
  )
  const section = document.createElement('section')
  for (let el = heading?.nextElementSibling; el; el = el.nextElementSibling) {
    if (/^H\d$/.test(el.tagName) && el.tagName <= heading.tagName) break
    section.appendChild(el.cloneNode(true))
  }
  return section
}

function normalize(text) {
  return text.replace(/\s+/g, ' ').trim()
}

// Markup conventions from the About page spec (docs/specs/about-page-revision.md: decision D1,
// Story 1, and the notes for implementers).
describe('about_page.md conventions', () => {
  const lines = aboutMarkdown.split('\n')

  it('has no inline style attributes', () => {
    expect(aboutMarkdown).not.toMatch(/\sstyle\s*=/i)
  })

  it('has no "---" horizontal rules', () => {
    expect(lines.filter((line) => /^\s*---+\s*$/.test(line))).toEqual([])
  })

  it('uses "##" for top-level sections', () => {
    const headings = lines.filter((line) => /^#{1,6}\s/.test(line))
    expect(headings.filter((line) => /^#\s/.test(line))).toEqual([])
    expect(headings[0]).toMatch(/^##\s/)
    // raw HTML headings would bypass the markdown convention
    expect(aboutMarkdown).not.toMatch(/<h[12][\s>]/i)
  })
})

// Team roster from the About page spec (Story 2, CAM-1507), in display order. Former
// contributors come last, with "Former Contributor" in place of an organization and no email.
const TEAM = [
  {
    name: 'Anthony Castronova',
    title: 'Lead of Research',
    org: 'CUAHSI',
    email: 'acastronova@cuahsi.org'
  },
  {
    name: 'Michael Durand',
    title: 'Professor',
    org: 'Ohio State University',
    email: 'durand.8@osu.edu'
  },
  {
    name: 'Bidhyananda Yadav',
    title: 'Research Associate',
    org: 'Ohio State University',
    email: 'yadav.111@osu.edu'
  },
  {
    name: 'Irene Garousi-Nejad',
    title: 'Research Scientist',
    org: 'CUAHSI',
    email: 'igarousi@cuahsi.org'
  },
  {
    name: 'Zahraa Alhmood',
    title: 'Research Software Developer',
    org: 'CUAHSI',
    email: 'zalhmood@cuahsi.org'
  },
  {
    name: 'Martin Seul',
    title: 'Lead of Software Engineering (acting)',
    org: 'CUAHSI',
    email: 'mseul@cuahsi.org'
  },
  {
    name: 'Devin Cowan',
    title: 'Research Software Developer',
    org: 'Former Contributor'
  }
]

describe('about_page.md project team', () => {
  const section = sectionAfter('SWOTViz Project Team')
  const cards = Array.from(section.querySelectorAll('.team-grid > .team-card'))

  it('shows one card per team member, in order', () => {
    expect(
      cards.map((card) => ({
        name: card.querySelector('h3')?.textContent.trim(),
        title: card.querySelector('.team-title')?.textContent.trim(),
        org: card.querySelector('.team-org')?.textContent.trim(),
        email: card.querySelector('.team-email')?.textContent.trim()
      }))
    ).toEqual(TEAM)
  })

  it('links each email with mailto:', () => {
    expect(cards.map((card) => card.querySelector('.team-email a')?.getAttribute('href'))).toEqual(
      TEAM.map(({ email }) => email && `mailto:${email}`)
    )
  })

  it('uses a bundled headshot for each member, with their name as alt text', () => {
    expect(
      cards.map((card) => {
        const img = card.querySelector('img')
        return [img?.getAttribute('alt'), img?.getAttribute('src')]
      })
    ).toEqual(TEAM.map(({ name }) => [name, expect.stringMatching(/^team\/[a-z-]+\.jpg$/)]))
  })

  it('only uses headings for names', () => {
    const headings = Array.from(section.querySelectorAll('*')).filter((el) =>
      /^H\d+$/.test(el.tagName)
    )
    expect(headings.map((el) => el.textContent.trim())).toEqual(TEAM.map(({ name }) => name))
    expect(headings.every((el) => el.tagName === 'H3')).toBe(true)
  })
})

// Discharge from the About page spec (Story 3, CAM-1508)
describe('about_page.md discharge', () => {
  const VARIABLES_HEADING = 'Which variables are used for plots in SWOTViz?'

  it('describes the consensus discharge plot, and its Time Range caveat, in the plot list', () => {
    const items = Array.from(
      sectionAfter('What types of plots does SWOTViz provide?').querySelectorAll('ul > li')
    )
    const item = items.find((li) => li.textContent.startsWith('Consensus discharge vs. time:'))

    expect(normalize(item?.textContent ?? '')).toBe(
      'Consensus discharge vs. time: The SWOTViz app displays SWOT Level 4 River Discharge, ' +
        'created by the Science Team Discharge Algorithm Working Group, version 3, as described ' +
        'here. Version 3 discharge was released in January 2026, and spans the period from ' +
        'launch to May 2, 2025. SWOTViz displays the Consensus discharge product. Note that ' +
        'SWOTViz will not display discharge unless the "Time Range" is set appropriately. Please ' +
        'see the link above for additional details about the discharge product.'
    )
    const link = item.querySelector('a')
    expect(link.textContent).toBe('here')
    expect(link.getAttribute('href')).toBe(
      'https://www.earthdata.nasa.gov/data/alerts-outages/swot-level-4-sword-science-river-discharge-products-version-3-released'
    )
  })

  it('lists sos_consensus_q in the variables table', () => {
    const rows = Array.from(sectionAfter(VARIABLES_HEADING).querySelectorAll('table tr')).map(
      (tr) => Array.from(tr.cells, (cell) => normalize(cell.textContent))
    )

    expect(rows).toContainEqual([
      'Reach',
      'sos_consensus_q',
      'Consensus discharge',
      'SWOT Level 4 SWORD of Science (SoS) Consensus discharge, version 3, matched to SWOT ' +
        'reach observation times. Available for reaches only, not nodes or lakes.',
      'm³/s'
    ])
  })

  it('distinguishes the Level 2 discharge fields from the discharge SWOTViz plots', () => {
    const paragraph = Array.from(sectionAfter('SWOT Background').querySelectorAll('p')).find((p) =>
      p.textContent.includes('dschg_c and dschg_g')
    )
    const text = normalize(paragraph?.textContent ?? '')
    const l2Sentence = text.indexOf('discharge (dschg_c and dschg_g')
    const swotvizSentence = text.indexOf(
      'SWOTViz does not plot these Level 2 discharge fields; instead it provides the SWOT ' +
        `Level 4 SoS Consensus discharge (sos_consensus_q), described in ${VARIABLES_HEADING}`
    )

    expect(l2Sentence).toBeGreaterThanOrEqual(0)
    expect(swotvizSentence).toBeGreaterThan(l2Sentence)
    const link = Array.from(paragraph.querySelectorAll('a')).find(
      (a) => a.textContent === VARIABLES_HEADING
    )
    expect(link?.getAttribute('href')).toBe('#which-variables-are-used-for-plots-in-swotviz')
  })
})

// Quality Level colours from the About page spec (CAM-1510). The swatch colours themselves come
// from the charts store (see AboutView.test.js); the markdown only names the level.
describe('about_page.md data quality', () => {
  const items = Array.from(sectionAfter('What does data quality mean?').querySelectorAll('ul > li'))

  it('lists each Quality Level with its colour word and a decorative swatch', () => {
    expect(
      items.map((li) => {
        const swatch = li.querySelector('.quality-swatch')
        return {
          text: normalize(li.textContent),
          swatch: swatch?.className,
          ariaHidden: swatch?.getAttribute('aria-hidden'),
          swatchFirst: li.firstElementChild === swatch
        }
      })
    ).toEqual(
      [
        ['good', 'Good (0, nominal): green'],
        ['suspect', 'Suspect (1): yellow'],
        ['degraded', 'Degraded (2): orange'],
        ['bad', 'Bad (3): red']
      ].map(([level, text]) => ({
        text,
        swatch: `quality-swatch quality-swatch--${level}`,
        ariaHidden: 'true',
        swatchFirst: true
      }))
    )
  })

  it('says Discharge has no quality flag and how its chart differs', () => {
    const paragraphs = Array.from(
      sectionAfter('What does data quality mean?').querySelectorAll('p'),
      (p) => normalize(p.textContent)
    )

    expect(paragraphs.filter((text) => text.startsWith('Discharge'))).toEqual([
      'Discharge has no quality flag, so the Discharge vs Time chart does not show quality ' +
        'levels: every point is drawn in the same colour, the Data Quality checkboxes are ' +
        'hidden, and the chart shows all discharge values in the Time Range.'
    ])
  })
})
