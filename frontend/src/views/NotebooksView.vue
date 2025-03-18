<template>
  <v-container>
    <div>
      <p>
        This page provides example notebooks for interacting with SWOT data.
        These notebooks are designed to be run in a Jupyter environment. 
        If you are not familiar with Jupyter, you can learn more about it <a href="https://jupyter.org/">here</a>.
      </p>
    </div>
    <v-alert v-if="isDev" type="warning" class="my-4">
      Notebooks must be manually rendered after updates. Run ./nbconvert/nvconvert.sh to build the
      notebooks.
    </v-alert>
    <v-row align="center" justify="center">
      <v-col v-for="notebook in notebooks" :key="notebook.name" cols="auto">
        <v-card class="mx-auto" variant="elevated" outlined>
          <v-card-item>
            <div>
              <div class="text-overline mb-1">
                {{ variant }}
              </div>
              <v-card-title> {{ removeExtension(notebook) }}</v-card-title>
              <!-- <v-card-subtitle></v-card-subtitle> -->
            </div>
          </v-card-item>
          <v-card-text>
            <!-- render a small view of the html -->
            <iframe
              :src="`/notebooks/${notebook_html_from_ipynb(notebook)}`"
              width="100%"
              height="200"
              frameborder="0"
              scrolling="yes"
            ></iframe>
          </v-card-text>
          <v-card-actions>
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
            <v-btn :href="binder_url(notebook)" target="_blank">
              <v-icon left>{{ mdiRocketLaunch }}</v-icon>
              Launch
              <v-tooltip activator="parent" location="bottom">
                Launch {{ notebook }} in Binder (JupyterHub)
              </v-tooltip>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { mdiDownloadBox, mdiNotebook, mdiRocketLaunch } from '@mdi/js'

const isDev = computed(() => process.env.NODE_ENV === 'development')
// TODO: update once merged
const REPO_BRANCH = 'develop'

// the public dir contains the rendered notebooks, for example:
// http://localhost:5173/notebooks/SWOT_GISshapefiles.html
// https://localhost/notebooks/SWOT_GISshapefiles.html

import { notebooks } from '@/notebooks'

const removeExtension = (name) => name.replace('.html', '').replace('.ipynb', '')
const notebook_html_from_ipynb = (html_name) => html_name.replace('.ipynb', '.html')
const binder_url = (name) =>
  `https://mybinder.org/v2/gh/CUAHSI/SWOT-Data-Viewer/${REPO_BRANCH}?urlpath=%2Fdoc%2Ftree%2Ffrontend%2Fpublic%2Fnotebooks%2F${name}`
</script>
