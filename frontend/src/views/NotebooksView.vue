<template>
  <v-container>
    <div>
      <p>
        This page provides example notebooks for interacting with SWOT data. These notebooks are
        designed to be run in a Jupyter environment. If you are not familiar with Jupyter, you can
        learn more about it <a href="https://jupyter.org/">here</a>.
      </p>
    </div>
    <v-alert v-if="isDev" type="warning">
      Notebooks must be manually rendered after updates. Run ./nbconvert/nvconvert.sh to build the
      notebooks.
    </v-alert>
    <v-card v-for="notebook in notebooks" :key="notebook.name" width="300">
      <template v-slot:title>
        <span class="font-weight-black">{{ removeExtension(notebook) }}</span>
      </template>
      <v-card-text class="d-flex justify-space-between">
        <v-btn :href="`/notebooks/${notebook_html_from_ipynb(notebook)}`" text target="_blank">
          <v-icon left>{{ mdiNotebook }}</v-icon>
          View
          <v-tooltip activator="parent" location="bottom">
            View rendered copy of {{ notebook_html_from_ipynb(notebook) }}
          </v-tooltip>
        </v-btn>
        <v-btn :href="`/notebooks/${notebook}`" download>
          <v-icon left>{{ mdiDownloadBox }}</v-icon>
          Download
          <v-tooltip activator="parent" location="bottom"> Download {{ notebook }} </v-tooltip>
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { mdiDownloadBox, mdiNotebook } from '@mdi/js'

const isDev = computed(() => process.env.NODE_ENV === 'development')

// the public dir contains the rendered notebooks, for example:
// http://localhost:5173/notebooks/SWOT_GISshapefiles.html
// https://localhost/notebooks/SWOT_GISshapefiles.html

import { notebooks } from '@/notebooks'

const removeExtension = (name) => name.replace('.html', '').replace('.ipynb', '')
const notebook_html_from_ipynb = (html_name) => html_name.replace('.ipynb', '.html')
</script>
