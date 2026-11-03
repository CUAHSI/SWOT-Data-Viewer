import { test, expect } from '@playwright/test'

// Layout checks for the About page (CAM-1506 acceptance criteria). jsdom does no layout,
// so these run in a real browser; behaviour that doesn't need layout is unit-tested in
// src/views/__tests__/AboutView.test.js.

const WIDTHS = [360, 768, 959, 960, 1440]
// Vuetify's md breakpoint, where the TOC switches from a stacked panel to a sidebar
const MD_BREAKPOINT = 960
// Widths at which the variables table (min-width 760px) is wider than the content area. At 960px
// the sidebar takes 264px of v-container's 900px max-width; at 959px and 1440px the table fits.
const TABLE_SCROLL_WIDTHS = [360, 768, 960]
// The sticky TOC sits 16px below the app bar (AboutView.vue's $sticky-offset)
const STICKY_TOP_TOLERANCE_PX = 40

// Stands in for every external image (they are hotlinked from HydroShare and other hosts).
// It is wider than any viewport, so an image the CSS doesn't constrain will overflow.
const STUB_IMAGE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="1000">' +
  '<rect width="2000" height="1000" fill="#ccc"/></svg>'

async function openAboutPage(page, baseURL) {
  const appOrigin = new URL(baseURL).origin
  await page.route('**/*', (route) => {
    const request = route.request()
    if (new URL(request.url()).origin === appOrigin) return route.continue()
    if (request.resourceType() === 'image') {
      return route.fulfill({ contentType: 'image/svg+xml', body: STUB_IMAGE })
    }
    return route.abort()
  })

  await page.goto('#/about')
  await expect(page.locator('.toc li a').first()).toBeAttached()
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('.about-content img')).every((img) => img.complete)
  )
}

async function getAppBarBottom(page) {
  return page.locator('#app-bar').evaluate((el) => el.getBoundingClientRect().bottom)
}

// TOC links scroll smoothly; wait until the scroll position stops changing
async function waitForScrollToSettle(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        let lastY = window.scrollY
        let stableFrames = 0
        const tick = () => {
          if (window.scrollY === lastY) stableFrames++
          else stableFrames = 0
          lastY = window.scrollY
          if (stableFrames >= 10) resolve()
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
  )
}

for (const width of WIDTHS) {
  test.describe(`About page at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } })

    test.beforeEach(async ({ page, baseURL }) => {
      await openAboutPage(page, baseURL)
    })

    test('has no horizontal page scroll', async ({ page }) => {
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }))
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
    })

    test('only the variables table scrolls sideways', async ({ page }) => {
      const scrollers = await page.evaluate(() =>
        Array.from(document.querySelectorAll('.about-page, .about-page *'))
          .filter((el) => {
            const { overflowX } = getComputedStyle(el)
            return ['auto', 'scroll'].includes(overflowX) && el.scrollWidth > el.clientWidth
          })
          .map((el) =>
            el.matches('.table-scroll') && el.textContent.includes('Variable Code')
              ? 'variables table'
              : `${el.tagName.toLowerCase()}.${el.className}`
          )
      )
      expect(scrollers.filter((scroller) => scroller !== 'variables table')).toEqual([])
      if (TABLE_SCROLL_WIDTHS.includes(width)) expect(scrollers).toEqual(['variables table'])
    })

    test('images stay within the content width', async ({ page }) => {
      const images = await page.evaluate(() => {
        const content = document.querySelector('.about-content')
        const style = getComputedStyle(content)
        const box = content.getBoundingClientRect()
        const left = box.left + parseFloat(style.paddingLeft)
        const right = box.right - parseFloat(style.paddingRight)
        return Array.from(content.querySelectorAll('img')).map((img) => {
          const rect = img.getBoundingClientRect()
          return {
            alt: img.alt,
            loaded: img.naturalWidth > 0,
            fits: rect.left >= left - 0.5 && rect.right <= right + 0.5
          }
        })
      })
      expect(images.length).toBeGreaterThan(0)
      expect(images.filter((img) => !img.loaded).map((img) => img.alt)).toEqual([])
      expect(images.filter((img) => !img.fits).map((img) => img.alt)).toEqual([])
    })

    if (width >= MD_BREAKPOINT) {
      test('shows the TOC as a sticky sidebar beside the content', async ({ page }) => {
        await expect(page.locator('.toc-toggle')).toHaveCount(0)
        await expect(page.locator('.toc ul')).toBeVisible()

        const tocBox = await page.locator('.toc').boundingBox()
        const contentBox = await page.locator('.about-content').boundingBox()
        expect(tocBox.x + tocBox.width).toBeLessThanOrEqual(contentBox.x)

        const appBarBottom = await getAppBarBottom(page)
        const scrollY = await page.evaluate(() => {
          window.scrollTo(0, 2000)
          return window.scrollY
        })
        expect(scrollY).toBeGreaterThan(0)
        const tocTop = await page.locator('.toc').evaluate((el) => el.getBoundingClientRect().top)
        expect(tocTop).toBeGreaterThanOrEqual(appBarBottom)
        expect(tocTop).toBeLessThan(appBarBottom + STICKY_TOP_TOLERANCE_PX)
      })
    } else {
      test('shows the TOC as a collapsed panel above the content', async ({ page }) => {
        const toggle = page.locator('.toc-toggle')
        await expect(toggle).toBeVisible()
        await expect(toggle).toHaveText('Contents')
        await expect(toggle).toHaveAttribute('aria-expanded', 'false')
        await expect(page.locator('.toc ul')).toBeHidden()

        const tocBox = await page.locator('.toc').boundingBox()
        const contentBox = await page.locator('.about-content').boundingBox()
        expect(tocBox.y + tocBox.height).toBeLessThanOrEqual(contentBox.y)
        expect(Math.abs(tocBox.x - contentBox.x)).toBeLessThan(1)
        expect(Math.abs(tocBox.width - contentBox.width)).toBeLessThan(1)
      })
    }

    test('every TOC link scrolls its heading into view below the app bar', async ({ page }) => {
      const appBarBottom = await getAppBarBottom(page)
      const links = page.locator('.toc li a')
      const linkCount = await links.count()
      expect(linkCount).toBeGreaterThan(0)

      const misplaced = []
      for (let i = 0; i < linkCount; i++) {
        await page.evaluate(() => window.scrollTo(0, 0))
        if (width < MD_BREAKPOINT) await page.locator('.toc-toggle').click()

        const text = (await links.nth(i).textContent()).trim()
        await links.nth(i).click()
        await waitForScrollToSettle(page)

        const heading = page
          .locator('.about-content')
          .getByRole('heading', { level: 2, name: text, exact: true })
        const { top, bottom, viewportHeight } = await heading.evaluate((el) => ({
          ...el.getBoundingClientRect().toJSON(),
          viewportHeight: window.innerHeight
        }))
        if (top < appBarBottom || bottom > viewportHeight) {
          misplaced.push(`${text} (top ${Math.round(top)}px)`)
        }
      }
      expect(misplaced).toEqual([])
    })
  })
}

// Project team (CAM-1507): one column on a phone, at most three on desktop, and every
// headshot served by the app itself rather than hotlinked.
const TEAM_GRID_COLUMNS = { 360: 1, 960: 2, 1440: 3, 2560: 3 }

for (const [width, columns] of Object.entries(TEAM_GRID_COLUMNS)) {
  test.describe(`About page team at ${width}px`, () => {
    test.use({ viewport: { width: Number(width), height: 800 } })

    test.beforeEach(async ({ page, baseURL }) => {
      await openAboutPage(page, baseURL)
    })

    test(`shows the team cards in ${columns} column(s)`, async ({ page }) => {
      const cardLefts = await page
        .locator('.team-grid > .team-card')
        .evaluateAll((cards) => cards.map((card) => Math.round(card.getBoundingClientRect().left)))
      expect(cardLefts).toHaveLength(7)
      expect(new Set(cardLefts).size).toBe(columns)
    })

    test('loads every headshot from the app origin', async ({ page, baseURL }) => {
      const images = await page
        .locator('.team-card img')
        .evaluateAll((imgs) =>
          imgs.map((img) => ({ src: img.currentSrc, loaded: img.naturalWidth > 0 }))
        )
      expect(images).toHaveLength(7)
      const appOrigin = new URL(baseURL).origin
      for (const { src, loaded } of images) {
        expect(new URL(src).origin, src).toBe(appOrigin)
        expect(loaded, src).toBe(true)
      }
    })
  })
}

// Discharge (CAM-1508)
const VARIABLES_HEADING = 'Which variables are used for plots in SWOTViz?'
// About 40 characters of body text, the narrowest the Description column should get
const MIN_DESCRIPTION_WIDTH_PX = 300
// A phone, and both ends of 960-1100px, where the sidebar TOC leaves the content area narrower
// than the table's min-width
const DISCHARGE_WIDTHS = [360, 960, 1100]

for (const width of DISCHARGE_WIDTHS) {
  test.describe(`About page discharge at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } })

    test.beforeEach(async ({ page, baseURL }) => {
      await openAboutPage(page, baseURL)
    })

    test('the variables table stays readable with the discharge row', async ({ page }) => {
      const table = page.locator('.table-scroll table')
      const descriptionWidth = await table
        .locator('th', { hasText: 'Description' })
        .evaluate((th) => th.getBoundingClientRect().width)
      expect(descriptionWidth).toBeGreaterThanOrEqual(MIN_DESCRIPTION_WIDTH_PX)

      // each line box of an inline element is one client rect
      const codeLines = await table
        .locator('td em', { hasText: 'sos_consensus_q' })
        .evaluate((em) => em.getClientRects().length)
      expect(codeLines).toBe(1)
    })

    test('the SWOT Background link scrolls to the variables section', async ({ page }) => {
      await page.getByRole('link', { name: VARIABLES_HEADING }).click()
      await waitForScrollToSettle(page)

      // still on the About route (the hash router keeps map state in the query)
      expect(new URL(page.url()).hash).toMatch(/^#\/about(\?|$)/)
      const appBarBottom = await getAppBarBottom(page)
      const { top, bottom, viewportHeight } = await page
        .getByRole('heading', { level: 3, name: VARIABLES_HEADING })
        .evaluate((el) => ({
          ...el.getBoundingClientRect().toJSON(),
          viewportHeight: window.innerHeight
        }))
      expect(top).toBeGreaterThanOrEqual(appBarBottom)
      expect(bottom).toBeLessThanOrEqual(viewportHeight)
      expect(top).toBeLessThan(appBarBottom + STICKY_TOP_TOLERANCE_PX)
    })
  })
}
