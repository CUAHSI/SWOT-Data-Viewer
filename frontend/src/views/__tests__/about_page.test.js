import { describe, it, expect } from 'vitest'
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
