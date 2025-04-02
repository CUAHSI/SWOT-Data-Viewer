<template>
  <v-container>
    <div>
      <p>
        This page provides example notebooks for interacting with SWOT data. These notebooks are
        designed to be run in a Jupyter environment. If you are not familiar with Jupyter, you can
        learn more about it <a href="https://jupyter.org/">here</a>.
      </p>
    </div>
    <v-alert v-if="isDev" type="warning" class="my-4">
      Notebooks must be manually rendered after updates. Run ./nbconvert/nvconvert.sh to build the
      notebooks.
    </v-alert>
    <v-row gutter="4" class="mb-4">
      <v-col v-for="notebook in notebooks" :key="notebook.filename">
        <v-card class="mx-auto" variant="elevated" outlined>
          <v-card-item>
            <div>
              <div class="text-overline mb-1">
                {{ variant }}
              </div>
              <v-card-title>{{ getTitle(notebook) }}</v-card-title>
              <v-card-subtitle>{{ notebook.META_SUBTITLE }}</v-card-subtitle>
            </div>
          </v-card-item>
          <v-card-text>
            {{ notebook.META_DESCRIPTION }}
          </v-card-text>
          <v-card-actions>
            <v-btn :href="nbviewer_url(notebook.filename)" text target="_blank">
              <v-icon left>{{ mdiNotebook }}</v-icon>
              View
              <v-tooltip activator="parent" location="bottom">
                View a rendered copy at nbviewer.org
              </v-tooltip>
            </v-btn>
            <v-btn :href="`/notebooks/${notebook.filename}`" download>
              <v-icon left>{{ mdiDownloadBox }}</v-icon>
              Download
            </v-btn>
            <v-btn :href="binder_url(notebook.filename)" target="_blank">
              <v-icon left>{{ mdiRocketLaunch }}</v-icon>
              Launch
              <v-tooltip activator="parent" location="bottom">
                Launch {{ notebook.filename }} using myBinder.org
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

// notebooks is an array of notebook objects, each with metadata
import { notebooks } from '@/notebooks'

const removeExtension = (name) => name.replace('.html', '').replace('.ipynb', '')
const binder_url = (name) =>
  `https://mybinder.org/v2/gh/CUAHSI/SWOT-Data-Viewer/${REPO_BRANCH}?urlpath=%2Fdoc%2Ftree%2Ffrontend%2Fpublic%2Fnotebooks%2F${name}`
const nbviewer_url = (name) =>
  `https://nbviewer.org/github/CUAHSI/SWOT-Data-Viewer/blob/${REPO_BRANCH}/frontend/public/notebooks/${name}`
const getTitle = computed(
  () => (notebook) => notebook.META_TITLE || removeExtension(notebook.filename)
)
</script>
