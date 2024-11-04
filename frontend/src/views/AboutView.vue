<template>
  <div v-html="aboutHtml" class="about-content"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { marked } from 'marked';
import about_page_url from '@/assets/documentation/about_page.md'

// use the about_page_url to fetch the markdown content
const aboutHtml = ref('');

onMounted(async () => {
  const response = await fetch(about_page_url);
  const markdownText = await response.text();
  aboutHtml.value = marked(markdownText);
});
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
  }
}
</style>


