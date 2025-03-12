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
    <v-card v-for="notebook in renderedNotebookList" :key="notebook.name" width="300">
      <template v-slot:title>
        <span class="font-weight-black">{{ removeExtension(notebook.name) }}</span>
      </template>
      <v-card-text class="d-flex justify-space-between">
        <v-btn :href="`/notebooks/${notebook.name}`" text target="_blank">
          <v-icon left>{{ mdiNotebook }}</v-icon>
          View
          <v-tooltip activator="parent" location="bottom">
            View rendered copy of {{ notebook.name }}
          </v-tooltip>
        </v-btn>
        <v-btn :href="`/notebooks/${notebook_name_from_html(notebook.name)}`" download>
          <v-icon left>{{ mdiDownloadBox }}</v-icon>
          Download
          <v-tooltip activator="parent" location="bottom">
            Download {{ notebook_name_from_html(notebook.name) }}
          </v-tooltip>
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import {
  mdiDownloadBox,
  mdiNotebook,
} from '@mdi/js'

const isDev = computed(() => process.env.NODE_ENV === 'development')

// the public dir contains the rendered notebooks, for example:
// http://localhost:5173/notebooks/SWOT_GISshapefiles.html
// https://localhost/notebooks/SWOT_GISshapefiles.html
// iterate over the files in the public/notebooks directory
// and create a list of the files
// this list will be used to render the links to the notebooks in the template

// https://vite.dev/guide/features.html#glob-import
const rendered_notebooks = import.meta.glob('/public/notebooks/*.html')
let renderedNotebookList = Object.keys(rendered_notebooks).map((path) => {
  const name = path.split('/').pop()
  return {
    name
  }
})

const removeExtension = (name) => name.replace('.html', '')

// create a list of ipynb files
const notebook_list = import.meta.glob('/public/notebooks/*.ipynb')
const notebookList = Object.keys(notebook_list).map((path) => {
  const name = path.split('/').pop()
  return {
    name
  }
})

const notebook_name_from_html = (html_name) => html_name.replace('.html', '.ipynb')

// check that every ipynb file has a corresponding html file
// if not, remove it
renderedNotebookList = renderedNotebookList.filter((notebook) => {
  const name = notebook_name_from_html(notebook.name)
  return notebookList.some((notebook) => notebook.name === notebook_name_from_html(name))
})

</script>