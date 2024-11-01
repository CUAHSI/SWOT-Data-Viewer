<template>
  <div v-html="aboutHtml" class="about-content"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { marked } from 'marked'; 
//import aboutContent from '../../../documentation/about_page.md';

//const aboutHtml = marked(aboutContent);
const aboutHtml = ref('');

onMounted(async () => {
  // Fetch the Markdown content from the public folder
  const response = await fetch('/documentation/about_page.md');
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


