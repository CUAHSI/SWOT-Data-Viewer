<template>
  <v-container>
    <div class="about-page" :class="{ 'about-page--stacked': isStacked }">
      <!-- Table of Contents Section -->
      <nav class="toc" aria-label="Table of Contents">
        <button
          v-if="isStacked"
          type="button"
          class="toc-toggle"
          :aria-expanded="tocOpen"
          aria-controls="toc-list"
          @click="tocOpen = !tocOpen"
        >
          <span>Contents</span>
          <v-icon :icon="tocOpen ? mdiChevronUp : mdiChevronDown" size="small" />
        </button>
        <h3 v-else>Table of Contents</h3>
        <ul v-show="!isStacked || tocOpen" id="toc-list">
          <li v-for="item in tocItems" :key="item.id">
            <a @click="scrollToSection(item.id)">{{ item.text }}</a>
          </li>
        </ul>
      </nav>

      <!-- About Content Section -->
      <div class="about-content" @click="onContentClick" v-html="aboutHtml" />
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useDisplay } from 'vuetify'
import { marked } from 'marked'
import { mdiChevronDown, mdiChevronUp } from '@mdi/js'
import about_page_url from '@/assets/about_page.md'

// about_page.md is fetched at runtime, so Vite never sees the image paths inside it.
// Glob the team headshots so Vite bundles them, keyed by the path the markdown uses
// (team/<file>, relative to src/assets, which also renders when previewing the markdown).
const teamImageUrls = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/team/*', { eager: true, query: '?url', import: 'default' })
  ).map(([path, url]) => [path.replace('../assets/', ''), url])
)

// below the md breakpoint (960px) the TOC becomes a collapsible panel above the content
const { mdAndUp } = useDisplay()
const isStacked = computed(() => !mdAndUp.value)
const tocOpen = ref(false)

// use the about_page_url to fetch the markdown content
const aboutHtml = ref('')
const tocItems = ref([]) // toc (table of contents) items

// fetch and process the markdown content
onMounted(async () => {
  const response = await fetch(about_page_url)
  const markdownText = await response.text()

  // convert markdown to HTML and set it
  aboutHtml.value = marked(markdownText, { gfm: true })

  // extract headings from the markdown content for the TOC
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = aboutHtml.value

  // give headings IDs so the TOC (<h2> only) and in-page links (#heading-id) can point at them
  const headings = Array.from(tempDiv.querySelectorAll('h2, h3'))
  headings.forEach((heading) => {
    heading.id = headingId(heading)
  })
  tocItems.value = headings
    .filter((heading) => heading.tagName === 'H2')
    .map((heading) => ({ id: heading.id, text: heading.textContent }))

  // wrap tables so wide tables scroll sideways instead of widening the page
  tempDiv.querySelectorAll('table').forEach((table) => {
    const wrapper = document.createElement('div')
    wrapper.className = 'table-scroll'
    table.replaceWith(wrapper)
    wrapper.appendChild(table)
  })

  // point team headshots at their bundled URLs
  tempDiv.querySelectorAll('img[src^="team/"]').forEach((img) => {
    const url = teamImageUrls[img.getAttribute('src')]
    if (url) img.src = url
  })

  // set the modified HTML back to the aboutHtml
  aboutHtml.value = tempDiv.innerHTML
})

// e.g. "Which variables are used for plots in SWOTViz?" -> "which-variables-are-used-for-plots-in-swotviz"
function headingId(heading) {
  return heading.textContent
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// The router uses hash history, so an in-page link (href="#heading-id") would be read as a
// route. Scroll to the heading instead; links to routes (href="#/...") are left to the router.
// Stop propagation too: swagger-ui-dist (ApiView) bundles zenscroll, whose window click
// listener scrolls to any "#" link and then pushes its href.
function onContentClick(event) {
  const link = event.target.closest('a[href^="#"]:not([href^="#/"])')
  if (!link) return
  event.preventDefault()
  event.stopPropagation()
  scrollToSection(link.getAttribute('href').slice(1))
}

// Scroll to the section smoothly
async function scrollToSection(id) {
  // collapse the panel first so its height change doesn't shift the scroll target
  tocOpen.value = false
  await nextTick()
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style lang="scss">
// Not scoped: the markdown is injected with v-html, so scoped styles would not reach it.
// Everything is nested under .about-page to keep these class names local to this view.
// Matches the height of the fixed v-app-bar in TheAppBar.vue.
$app-bar-height: 70px;
// Keeps the sticky TOC and scrolled-to headings clear of the app bar.
$sticky-offset: $app-bar-height + 16px;

.about-page {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 24px;
  align-items: start;

  &.about-page--stacked {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }

  /* Table of Contents (TOC) styles */
  .toc {
    position: sticky;
    top: $sticky-offset;
    max-height: calc(100vh - #{$sticky-offset + 16px});
    overflow-y: auto;
    background-color: #f9f9f9;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 4px #ded9d9;
    font-size: 14px;
    line-height: 1.4;

    h3 {
      font-size: 13px;
      margin-bottom: 0.75em;
    }

    ul {
      list-style: none;
      padding: 0;
    }

    li {
      margin-bottom: 0.6em;
    }

    a {
      text-decoration: none;
      color: #616365;
      cursor: pointer; /* link is clickable */
    }

    a:hover {
      text-decoration: underline;
    }
  }

  &.about-page--stacked .toc {
    position: static;
    max-height: none;

    ul {
      margin-top: 0.75em;
    }
  }

  .toc-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
  }

  .about-content {
    min-width: 0;
    font-family: 'Roboto', sans-serif;
    font-size: 15px;
    line-height: 1.6;
    color: #333;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow-wrap: anywhere;

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: #2c3e50;
      line-height: 1.3;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }

    h2 {
      font-size: 1.6em;
      margin-top: 2em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid #e0e0e0;
      scroll-margin-top: $sticky-offset;

      &:first-child {
        margin-top: 0;
      }
    }

    h3 {
      font-size: 1.25em;
      scroll-margin-top: $sticky-offset;
    }

    h4 {
      font-size: 1.15em;
    }

    p {
      margin-bottom: 1em;
    }

    ul,
    ol {
      margin: 1em 0;
      padding-left: 1.5em;
    }

    img {
      max-width: 100%;
      height: auto;
    }

    .table-scroll {
      overflow-x: auto;
      margin: 1em 0;
    }

    table {
      width: 100%;
      min-width: 760px;
      border-collapse: collapse;
      border: 1px solid #ddd;
      overflow-wrap: normal;
    }

    th,
    td {
      border: 1px solid #ddd;
      padding: 8px;
      vertical-align: top;
    }

    th {
      background-color: #f2f2f2;
      color: #333;
      text-align: left;
    }

    blockquote {
      margin: 1em 0;
      padding: 0.5em 1em;
      background-color: #f9f9f9;
      border-left: 5px solid #ccc;
      color: #666;
    }

    code {
      background-color: #f3f3f3;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: 'Courier New', Courier, monospace;
    }

    pre {
      background-color: #f3f3f3;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }

    /* Info callout */
    .callout {
      margin: 1em 0 1.5em;
      padding: 12px 16px;
      border-left: 5px solid #4682b4;
      border-radius: 8px;
      background-color: #f5f5f5;

      .callout-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
      }

      .callout-icon {
        font-size: 1.5em;
        line-height: 1;
        color: #4682b4;
      }

      ul {
        margin: 0.5em 0 0;
        padding-left: 1.25em;
      }
    }

    /* Plot type cards: side by side when there is room, stacked otherwise */
    .plot-cards {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin: 1em 0 1.5em;
    }

    .plot-card {
      display: flex;
      flex: 1 1 260px;
      flex-direction: column;
      max-width: 400px;
      padding: 20px;
      border-radius: 8px;
      background-color: #c4d8e2;

      &:nth-child(even) {
        background-color: #afeeee;
      }

      h3 {
        margin-top: 0;
      }

      img {
        width: 100%;
        height: 200px;
        object-fit: cover;
      }

      p {
        flex-grow: 1;
        margin: 15px 0 0;
      }
    }

    /* Project team: one column on a phone, up to three on desktop */
    .team-grid {
      $gap: 12px;
      display: grid;
      // columns are at least 220px and at least a third of the row, so never more than three
      grid-template-columns: repeat(
        auto-fill,
        minmax(min(100%, max(220px, (100% - 2 * #{$gap}) / 3)), 1fr)
      );
      gap: $gap;
      margin: 1em 0;
    }

    .team-card {
      padding: 12px;
      border: 1px solid lightgray;
      border-radius: 8px;

      img {
        display: block;
        width: 120px;
        border-radius: 8px;
      }

      h3 {
        margin: 0.75em 0 0;
        font-size: 1.15em;
      }

      .team-title,
      .team-org,
      .team-email {
        margin: 0.25em 0 0;
        line-height: 1.4;
      }

      .team-title {
        color: #555;
      }

      .team-org {
        font-size: 0.95em;
        color: gray;
      }

      .team-email {
        font-size: 0.95em;
      }
    }

    /* Partners: text beside the logo, logo wraps below on narrow screens */
    .partners {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px 24px;

      p {
        flex: 1 1 260px;
        margin: 0;
      }

      img {
        flex: none;
      }
    }
  }
}
</style>
