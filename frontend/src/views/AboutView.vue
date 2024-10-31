<template>
  <div v-html="aboutHtml" class="about-content"></div>
</template>

<script setup>
import { marked } from 'marked';
import aboutContent from '../../../documentation/about_page.md';

const aboutHtml = marked(aboutContent);
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
  }
}
</style>


