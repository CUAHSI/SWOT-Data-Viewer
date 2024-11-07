<template>
  <v-container>
    <div v-html="aboutHtml" class="about-content"></div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { marked } from 'marked';
import about_page_url from '@/assets/about_page.md'

// use the about_page_url to fetch the markdown content
const aboutHtml = ref('');

onMounted(async () => {
  const response = await fetch(about_page_url);
  const markdownText = await response.text();
  aboutHtml.value = marked(markdownText, { gfm: true });
});
</script>

<style lang="scss">
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

.about-content th, .about-content td {
  border: 1px solid #ddd;
  padding: 8px;
}

.about-content th {
  background-color: #f2f2f2;
  color: #333;
  text-align: left;
}

.about-content h1, .about-content h2, .about-content h3, .about-content h4, .about-content h5, .about-content h6 {
  color: #2c3e50;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.about-content p {
  margin-bottom: 1em;
}

.about-content ul, .about-content ol {
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
</style>