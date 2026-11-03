import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import aboutPageUrl from '@/assets/about_page.md'
import castronovaUrl from '@/assets/team/castronova.jpg'
import AboutView from '../AboutView.vue'

const markdown = `## First Section

Intro text.

### Not In The TOC

| Code | Description |
| ---- | ----------- |
| wse  | Water surface elevation |

## Second Section: Details

| A | B |
| - | - |
| 1 | 2 |
`

async function mountAboutView({ width = 1440, content = markdown } = {}) {
  // Vuetify's useDisplay reads window.innerWidth when the instance is created
  window.innerWidth = width
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url) => {
      if (url !== aboutPageUrl) throw new Error(`Unexpected fetch: ${url}`)
      return new Response(content)
    })
  )
  const vuetify = createVuetify({ icons: { defaultSet: 'mdi', aliases, sets: { mdi } } })
  const wrapper = mount(AboutView, { global: { plugins: [vuetify] }, attachTo: document.body })
  await flushPromises()
  return wrapper
}

// jsdom does no layout, so it has no scrollIntoView to spy on
function stubScrollIntoView() {
  Element.prototype.scrollIntoView = vi.fn()
  return Element.prototype.scrollIntoView
}

afterEach(() => {
  vi.unstubAllGlobals()
  delete Element.prototype.scrollIntoView
  document.body.innerHTML = ''
})

describe('AboutView', () => {
  it('builds one TOC item per <h2> and gives each heading a matching id', async () => {
    const wrapper = await mountAboutView()

    const links = wrapper.findAll('.toc li a')
    expect(links.map((link) => link.text())).toEqual(['First Section', 'Second Section: Details'])

    const headingIds = wrapper.findAll('.about-content h2').map((h2) => h2.attributes('id'))
    expect(headingIds).toEqual(['first-section', 'second-section-details'])
  })

  it('wraps every table in a .table-scroll container', async () => {
    const wrapper = await mountAboutView()

    expect(wrapper.findAll('.about-content table')).toHaveLength(2)
    expect(wrapper.findAll('.about-content .table-scroll > table')).toHaveLength(2)
  })

  it('serves team headshots referenced as team/<file> from the bundled assets', async () => {
    const wrapper = await mountAboutView({
      content: `## Team\n\n<img src="team/castronova.jpg" alt="Anthony Castronova">\n`
    })

    expect(wrapper.find('.about-content img').attributes('src')).toBe(castronovaUrl)
  })

  describe('at or above the md breakpoint (960px)', () => {
    it('shows the TOC list without a toggle', async () => {
      const wrapper = await mountAboutView({ width: 960 })

      expect(wrapper.find('.toc-toggle').exists()).toBe(false)
      expect(wrapper.find('.toc h3').text()).toBe('Table of Contents')
      expect(wrapper.find('#toc-list').isVisible()).toBe(true)
    })
  })

  describe('below the md breakpoint (960px)', () => {
    it('renders the TOC as a "Contents" panel, collapsed by default', async () => {
      const wrapper = await mountAboutView({ width: 959 })

      const toggle = wrapper.find('.toc-toggle')
      expect(toggle.text()).toBe('Contents')
      expect(toggle.attributes('aria-expanded')).toBe('false')
      expect(wrapper.find('#toc-list').isVisible()).toBe(false)
    })

    it('opens the panel when the toggle is clicked', async () => {
      const wrapper = await mountAboutView({ width: 959 })

      await wrapper.find('.toc-toggle').trigger('click')

      expect(wrapper.find('.toc-toggle').attributes('aria-expanded')).toBe('true')
      expect(wrapper.find('#toc-list').isVisible()).toBe(true)
    })

    it('closes the panel when a TOC link is clicked', async () => {
      stubScrollIntoView()
      const wrapper = await mountAboutView({ width: 959 })
      await wrapper.find('.toc-toggle').trigger('click')

      await wrapper.find('.toc li a').trigger('click')
      await flushPromises()

      expect(wrapper.find('.toc-toggle').attributes('aria-expanded')).toBe('false')
      expect(wrapper.find('#toc-list').isVisible()).toBe(false)
    })
  })

  it.each([959, 1440])(
    'scrolls to the heading when a TOC link is clicked (%ipx)',
    async (width) => {
      const scrollIntoView = stubScrollIntoView()
      const wrapper = await mountAboutView({ width })

      await wrapper.findAll('.toc li a')[1].trigger('click')
      await flushPromises()

      expect(scrollIntoView).toHaveBeenCalledTimes(1)
      expect(scrollIntoView.mock.contexts[0]).toBe(
        document.getElementById('second-section-details')
      )
    }
  )

  it('scrolls to the heading an in-page link points at, without changing the route', async () => {
    const scrollIntoView = stubScrollIntoView()
    const wrapper = await mountAboutView({
      content: `## Intro\n\nSee [the details](#which-details).\n\n## Other\n\n### Which details?\n`
    })
    window.history.replaceState(null, '', '#/about')

    // a native click, so jsdom follows the link unless the view prevents it; jsdom navigates on
    // a later task, so wait for one before checking the URL
    wrapper.find('.about-content a').element.click()
    await new Promise((resolve) => setTimeout(resolve))

    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView.mock.contexts[0].textContent).toBe('Which details?')
    expect(scrollIntoView.mock.contexts[0].id).toBe('which-details')
    expect(window.location.hash).toBe('#/about')
  })

  it('leaves links to other routes to the router', async () => {
    const scrollIntoView = stubScrollIntoView()
    const wrapper = await mountAboutView({
      content: `## Intro\n\nSee the [notebooks](#/notebooks).\n`
    })
    window.history.replaceState(null, '', '#/about')

    wrapper.find('.about-content a').element.click()
    await new Promise((resolve) => setTimeout(resolve))

    expect(scrollIntoView).not.toHaveBeenCalled()
    expect(window.location.hash).toBe('#/notebooks')
  })
})
