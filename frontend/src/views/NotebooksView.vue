<template>
  <v-container>
    <div>
      <p>
        This page provides example notebooks for interacting with SWOT data.
        These notebooks are designed to be run in a Jupyter environment. 
        If you are not familiar with Jupyter, you can learn more about it <a href="https://jupyter.org/">here</a>.
      </p>
    </div>
    <v-alert v-if="isDev" type="warning">
      Notebooks must be manually rendered after updates. Run ./nbconvert/nvconvert.sh to build the notebooks.
    </v-alert>
    <v-card>
      <v-card-text>
        <v-btn v-for="notebook in notebookList" :key="notebook.name" :href="`/notebooks/${notebook.name}`" text>
          {{ removeExtension(notebook.name) }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'

const isDev = computed(() => process.env.NODE_ENV === 'development')

// the public dir contains the rendered notebooks, for example:
// http://localhost:5173/notebooks/SWOT_GISshapefiles.html
// https://localhost/notebooks/SWOT_GISshapefiles.html
// iterate over the files in the public/notebooks directory
// and create a list of the files
// this list will be used to render the links to the notebooks in the template

// https://vite.dev/guide/features.html#glob-import
const notebooks = import.meta.glob('/public/notebooks/*.html')
const notebookList = Object.keys(notebooks).map((path) => {
  const name = path.split('/').pop()
  return {
    name
  }
})

const removeExtension = (name) => name.replace('.html', '')

</script>