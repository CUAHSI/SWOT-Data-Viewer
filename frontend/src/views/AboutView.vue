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
      <div class="about-content" v-html="aboutHtml" />
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useDisplay } from 'vuetify'
import { marked } from 'marked'
import { mdiChevronDown, mdiChevronUp } from '@mdi/js'
import about_page_url from '@/assets/about_page.md'

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

  // extract headings and generate TOC items with IDs
  tocItems.value = Array.from(tempDiv.querySelectorAll('h2')).map((heading) => {
    const id = heading.innerText.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    heading.id = id // Set the ID on the heading itself
    return {
      id,
      text: heading.innerText
    }
  })

  // wrap tables so wide tables scroll sideways instead of widening the page
  tempDiv.querySelectorAll('table').forEach((table) => {
    const wrapper = document.createElement('div')
    wrapper.className = 'table-scroll'
    table.replaceWith(wrapper)
    wrapper.appendChild(table)
  })

  // set the modified HTML back to the aboutHtml
  aboutHtml.value = tempDiv.innerHTML
})

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

    /* Project team */
    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 12px;
      margin: 1em 0;
    }

    .team-card {
      padding: 12px;
      border: 1px solid lightgray;
      border-radius: 8px;

      h4 {
        margin-top: 0;
      }

      img {
        width: 120px;
      }

      .team-title,
      .team-org,
      .team-email {
        margin: 0.25em 0 0;
        font-weight: 500;
        line-height: 1.4;
      }

      .team-title {
        font-size: 1.1em;
        color: gray;
      }

      .team-org {
        font-size: 0.95em;
        color: gray;
      }

      .team-email {
        font-size: 1em;
        color: skyblue;
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
