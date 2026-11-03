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

  it('says Discharge has no quality flag', () => {
    const text = normalize(sectionAfter('What does data quality mean?').textContent)

    expect(text).toContain('Discharge has no quality flag.')
  })
})

// Stale content from the About page spec (Story 4, CAM-1509)
describe('about_page.md mission status', () => {
  const paragraph = sectionAfter('SWOT Background').querySelector('p')
  const text = normalize(paragraph?.textContent ?? '')

  // swot.jpl.nasa.gov/mission/overview/ now returns 404 and published no end date for the
  // science phase, so the page defers to NASA's mission page instead of naming a year.
  it('does not give a science phase end date that has passed', () => {
    expect(text).toContain('“science” phase')
    expect(text).not.toMatch(/through 2025/)
    expect(text).not.toContain('swot.jpl.nasa.gov/mission/overview')
  })

  it('points to the NASA SWOT mission page for the current mission status', () => {
    expect(
      Array.from(paragraph.querySelectorAll('a'), (a) => [a.textContent, a.getAttribute('href')])
    ).toContainEqual(['NASA SWOT mission page', 'https://science.nasa.gov/mission/swot/'])
  })
})

describe('about_page.md scientific use-case examples', () => {
  const section = sectionAfter('Scientific Use-Case Examples')

  // HydroShare collection ac6cc75dcb0146cf9cc17a974f4bb08b (the Notebooks page's collection),
  // as of 2026-11-02
  it('lists each notebook with a HydroShare link, its authors, and a one-sentence description', () => {
    expect(
      Array.from(section.querySelectorAll('ul > li'), (li) => {
        const link = li.querySelector('a')
        const [, authors, description] =
          normalize(li.textContent).match(/^.+?, (.+? \(\d{4}\))\. ([^.]+\.)$/) ?? []
        return {
          title: link?.textContent,
          href: link?.getAttribute('href'),
          titleFirst: li.firstChild === link,
          authors,
          description: description && 'one sentence'
        }
      })
    ).toEqual(
      [
        [
          'Visualizing SWOT Discharge Data from the SWORD of Science (SoS) Dataset',
          'cdae2ab2435c4baa999c1dca091073ab',
          'Castronova and Garousi-Nejad (2026)'
        ],
        [
          'Visualizing SWOT River Longitudinal Profiles for Water Resources',
          '1e5dff3ab72440d2a4e3942326ada5a4',
          'Durand and Yadav (2026)'
        ],
        [
          'Validating SWORD of Science (SoS) Discharge Estimates with Hydrology Community ' +
            'Discharge Streamflow Observations (SWOT SHCQ)',
          '1cc0fdda275340ff9d6682627d09a3b9',
          'Castronova and Garousi-Nejad (2026)'
        ]
      ].map(([title, id, authors]) => ({
        title,
        href: `https://www.hydroshare.org/resource/${id}/`,
        titleFirst: true,
        authors,
        description: 'one sentence'
      }))
    )
  })

  it('no longer promises notebooks "soon"', () => {
    expect(normalize(section.textContent)).not.toMatch(/added soon/i)
  })

  it('ends by linking to the Notebooks page for the full list', () => {
    const last = section.lastElementChild

    expect(last?.tagName).toBe('P')
    expect(last.querySelector('a')?.getAttribute('href')).toBe('#/notebooks')
  })
})

describe('about_page.md links', () => {
  const hrefs = Array.from(aboutDoc.querySelectorAll('a[href]'), (a) => a.getAttribute('href'))

  // Pre-signed CloudFront URLs expire (the originals returned 403 from Oct 2024). PO.DAAC's
  // archive.podaac.earthdata.nasa.gov URLs are stable and redirect to a freshly signed copy.
  it('has no expiring pre-signed links', () => {
    expect(hrefs.filter((href) => /Expires=|cloudfront\.net/.test(href))).toEqual([])
  })

  it('links the SWOT product description documents from the PO.DAAC archive', () => {
    const links = Array.from(sectionAfter('Product description').querySelectorAll('a'), (a) => [
      a.textContent,
      a.getAttribute('href')
    ])
    const docs =
      'https://archive.podaac.earthdata.nasa.gov/podaac-ops-cumulus-docs/web-misc/swot_mission_docs'

    expect(links).toEqual([
      ['SWOT Data User Handbook', `${docs}/D-109532_SWOT_UserHandbook_RevA_20250311_sig-final.pdf`],
      [
        'SWOT Level 2 Lake Single-Pass Vector Data Product, Version D',
        `${docs}/pdd/SWOT-TN-CDM-0673-CNES_Product_Description_L2_HR_LakeSP_20250307_RevC_signed.pdf`
      ],
      [
        'SWOT Level 2 River Single-Pass Vector Data Product, Version D',
        `${docs}/pdd/D-56413_SWOT_Product_Description_L2_HR_RiverSP_20250224a_RevC_clean_sig_final.pdf`
      ]
    ])
  })

  // SWOTViz reads the Version D collections from Hydrocron (_helpers/hydroCron.js); "_2.0" is
  // Version C. Discharge is the exception (still 2.0), but the page links no discharge dataset.
  it('links the Version D PO.DAAC datasets, not the superseded Version C (2.0) ones', () => {
    const datasets = hrefs.filter((href) => href.startsWith('https://podaac.jpl.nasa.gov/dataset/'))

    expect(datasets.length).toBeGreaterThan(0)
    expect(datasets.filter((href) => !/_D$/.test(href))).toEqual([])
    expect(
      Array.from(sectionAfter('Product links').querySelectorAll('a'), (a) => [
        a.textContent,
        a.getAttribute('href')
      ])
    ).toEqual([
      ['SWOT River Database', 'https://www.swordexplorer.com/'],
      ['SWOT Prior Lake Database', 'https://hydroweb.next.theia-land.fr/'],
      [
        'PO.DAAC SWOT River Vector Data',
        'https://podaac.jpl.nasa.gov/dataset/SWOT_L2_HR_RiverSP_D'
      ],
      ['PO.DAAC SWOT Lake Vector Data', 'https://podaac.jpl.nasa.gov/dataset/SWOT_L2_HR_LakeSP_D']
    ])
  })

  // The Hydrocron docs moved; the old hydrocron_tutorial.html returns 404
  it('links the current Hydrocron tutorial', () => {
    const tutorials = hrefs.filter((href) => href.includes('podaac.github.io/hydrocron/'))

    expect(tutorials.length).toBeGreaterThan(0)
    expect(
      tutorials.filter((href) => href !== 'https://podaac.github.io/hydrocron/hydrocron-tutorial')
    ).toEqual([])
  })
})
