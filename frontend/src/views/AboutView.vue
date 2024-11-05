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
  aboutHtml.value = marked(markdownText);
});
</script>

<style lang="scss">
.about-content {
  font-family: 'Roboto', sans-serif !important;
  line-height: 1.6 !important;
  color: #333 !important;
  padding: 20px !important;
  background-color: #fff !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}
.about-content table {
  width: 100% !important;
  border-collapse: collapse !important;
  margin: 1em 0 !important;
  border: 1px solid #ddd !important;
}

.about-content th, .about-content td {
  border: 1px solid #ddd !important;
  padding: 8px !important;
}

.about-content th {
  background-color: #f2f2f2 !important;
  color: #333 !important;
  text-align: left !important;
}

.about-content h1, .about-content h2, .about-content h3, .about-content h4, .about-content h5, .about-content h6 {
  color: #2c3e50 !important;
  margin-top: 1.5em !important;
  margin-bottom: 0.5em !important;
}

.about-content p {
  margin-bottom: 1em !important;
}

.about-content ul, .about-content ol {
  margin: 1em 0 !important;
  padding-left: 1.5em !important;
}

.about-content blockquote {
  margin: 1em 0 !important;
  padding: 0.5em 1em !important;
  background-color: #f9f9f9 !important;
  border-left: 5px solid #ccc !important;
  color: #666 !important;
}

.about-content code {
  background-color: #f3f3f3 !important;
  padding: 2px 4px !important;
  border-radius: 4px !important;
  font-family: 'Courier New', Courier, monospace !important;
}

.about-content pre {
  background-color: #f3f3f3 !important;
  padding: 10px !important;
  border-radius: 4px !important;
  overflow-x: auto !important;
}
@media (min-width: 1024px) {
  .about {
    min-height: 100vh !important;
  }
}
</style>