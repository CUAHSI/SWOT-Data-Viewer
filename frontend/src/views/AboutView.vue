<template>
  <v-container>
    <div class="about-page">
      <!-- Table of Contents Section -->
      <nav class="toc">
        <h3>Table of Contents</h3>
        <ul>
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
import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import about_page_url from '@/assets/about_page.md'

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

  // set the modified HTML back to the aboutHtml
  aboutHtml.value = tempDiv.innerHTML
})

// Scroll to the section smoothly
function scrollToSection(id) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style lang="scss">
.about-page {
  display: flex;
  gap: 20px; /* Space between TOC and content */
}

.about-content {
  font-family: 'Roboto', sans-serif;
  line-height: 1.6;
  color: #333;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.about-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  border: 1px solid #ddd;
}

.about-content th,
.about-content td {
  border: 1px solid #ddd;
  padding: 8px;
}

.about-content th {
  background-color: #f2f2f2;
  color: #333;
  text-align: left;
}

.about-content h1,
.about-content h2,
.about-content h3,
.about-content h4,
.about-content h5,
.about-content h6 {
  color: #2c3e50;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.about-content p {
  margin-bottom: 1em;
}

.about-content ul,
.about-content ol {
  margin: 1em 0;
  padding-left: 1.5em;
}

.about-content blockquote {
  margin: 1em 0;
  padding: 0.5em 1em;
  background-color: #f9f9f9;
  border-left: 5px solid #ccc;
  color: #666;
}

.about-content code {
  background-color: #f3f3f3;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
}

.about-content pre {
  background-color: #f3f3f3;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
  }
}

/* Table of Contents (TOC) styles */
.toc {
  width: 1200px;
  position: sticky;
  top: 50px;
  align-self: start;
  background-color: #f9f9f9;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 4px #ded9d9;
}

.toc h3 {
  font-size: 0.75em;
  margin-bottom: 0.5em;
}

.toc ul {
  list-style: none;
  padding: 0;
}

.toc li {
  margin-bottom: 0.8em;
}

.toc a {
  text-decoration: none;
  color: #616365;
  font-size: 0.75em;
  cursor: pointer; /* link is clickable */
}

.toc a:hover {
  text-decoration: underline;
}
</style>
