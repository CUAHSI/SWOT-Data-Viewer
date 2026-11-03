import { describe, it, expect } from 'vitest'
import { marked } from 'marked'
import aboutMarkdown from '@/assets/about_page.md?raw'

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

// Team roster from the About page spec (Story 2, CAM-1507), in display order.
const TEAM = [
  {
    name: 'Anthony Castronova',
    title: 'Lead of Research',
    org: 'CUAHSI',
    email: 'acastronova@cuahsi.org'
  },
  {
    name: 'Irene Garousi-Nejad',
    title: 'Research Scientist',
    org: 'CUAHSI',
    email: 'igarousi@cuahsi.org'
  },
  {
    name: 'Martin Seul',
    title: 'Lead of Software Engineering (acting)',
    org: 'CUAHSI',
    email: 'mseul@cuahsi.org'
  },
  {
    name: 'Zahraa Alhmood',
    title: 'Research Software Developer',
    org: 'CUAHSI',
    email: 'zalhmood@cuahsi.org'
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
  }
]

describe('about_page.md project team', () => {
  // the rendered "SWOTViz Project Team" section, up to the next <h2>
  const doc = new DOMParser().parseFromString(marked(aboutMarkdown, { gfm: true }), 'text/html')
  const heading = Array.from(doc.querySelectorAll('h2')).find(
    (h2) => h2.textContent === 'SWOTViz Project Team'
  )
  const section = document.createElement('section')
  for (let el = heading?.nextElementSibling; el && el.tagName !== 'H2'; ) {
    const next = el.nextElementSibling
    section.appendChild(el)
    el = next
  }
  const cards = Array.from(section.querySelectorAll('.team-grid > .team-card'))

  it('shows one card per current team member, in order', () => {
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
      TEAM.map(({ email }) => `mailto:${email}`)
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

  it('lists Devin Cowan only as a former contributor', () => {
    expect(section.textContent).toContain('Former contributors: Devin Cowan')
    expect(aboutMarkdown.match(/Devin Cowan/g)).toHaveLength(1)
    expect(aboutMarkdown).not.toMatch(/dcowan|Devin-Cowan/i)
  })
})
