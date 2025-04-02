<template>
  <v-container>
    <div>
      <p>
        This page provides example notebooks for interacting with SWOT data. These notebooks are
        designed to be run in a Jupyter environment. If you are not familiar with Jupyter, you can
        learn more about it <a href="https://jupyter.org/">here</a>.
      </p>
    </div>
    <v-row gutter="4" class="mb-4">
      <v-col v-for="resource in resourcesMetadata" :key="resource.id">
        <v-card class="mx-auto" variant="elevated" outlined>
          <v-card-item>
            <div>
              <div class="text-overline mb-1">
                {{ variant }}
              </div>
              <v-card-title>{{ resource.title }}</v-card-title>
              <v-card-subtitle>{{ authors(resource) }}</v-card-subtitle>
            </div>
          </v-card-item>
          <v-card-text>
            {{ resource.abstract }}
            <div class="my-2" style="color: grey">
              {{ resource.citation }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn>
              View
              <v-menu activator="parent">
                <v-list
                  v-if="resource.notebooks.length > 1"
                  dense
                  class="pa-0"
                  style="width: 300px"
                  max-height="400px"
                  overflow-y="auto"
                >
                  <v-list-item
                    v-for="notebookUrl in resource.notebooks"
                    :key="notebookUrl"
                    :value="notebookUrl"
                    :href="nbviewer_url(notebookUrl)"
                    target="_blank"
                  >
                    <v-list-item-title>
                      <v-icon left>{{ mdiNotebook }}</v-icon>
                      {{ notebookUrl.split('/').pop() }}
                      <v-tooltip activator="parent" location="bottom">
                        View a rendered copy at nbviewer.org
                      </v-tooltip>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
                <v-btn v-else :href="nbviewer_url(resource.notebooks[0])" target="_blank">
                  <v-icon left>{{ mdiNotebook }}</v-icon>
                  {{ resource.notebooks[0].split('/').pop() }}
                  <v-tooltip activator="parent" location="bottom">
                    View a rendered copy at nbviewer.org
                  </v-tooltip>
                </v-btn>
              </v-menu>
            </v-btn>
            <v-btn :href="hydroShareBagUrl(resource)" download>
              <v-icon left>{{ mdiDownloadBox }}</v-icon>
              Download
            </v-btn>
            <v-btn :href="cuahsi_jh_url(resource)" target="_blank">
              <v-icon left>{{ mdiRocketLaunch }}</v-icon>
              Launch
              <v-tooltip activator="parent" location="bottom">
                Launch using CUAHSI JupyterHub
              </v-tooltip>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, ref, onBeforeMount } from 'vue'
import { mdiDownloadBox, mdiNotebook, mdiRocketLaunch } from '@mdi/js'
// TODO use the collection
// import { VITE_HYDROSHARE_NOTEBOOKS_COLLECTION } from '@/constants'

const resourcesMetadata = ref([])

// TODO get a list of resource ids from the HS collection
// for now we just use one
const resourceIds = ['ff48614339034212bb7b31cb719c0aa0']

onBeforeMount(async () => {
  // get the metadata for each resource id, using the HydroShare API
  resourcesMetadata.value = await Promise.all(
    resourceIds.map(async (resourceId) => {
      return await getResourceMetadata(resourceId)
    })
  )
  console.log('resourcesMetadata', resourcesMetadata.value)
})

// notebooks is an array of resource objects, each with metadata

const cuahsi_jh_url = (resource) =>
  `https://jupyterhub.cuahsi.org/hub/spawn?next=/user-redirect/nbfetch/hs-pull?id=${resource.id}`

const nbviewer_url = (notebookUrl) => {
  return `https://nbviewer.org/urls/${notebookUrl}`
}

const notebooks_in_resource = async (resourceId) => {
  // for the resource, get a list of all the notebook files
  const fetchUrl = `https://www.hydroshare.org/hsapi/resource/${resourceId}/files/`
  const files = await fetch(fetchUrl)
    .then((response) => response.json())
    .then((data) => {
      return data.results.filter((file) => file.file_name.endsWith('.ipynb'))
    })
  // strip the scheme from the urls
  const urls = files.map((file) => file.url.replace('https://', '').replace('http://', ''))
  return urls
}

const authors = computed(
  () => (resource) => resource.creators.map((author) => author.name).join(', ')
)
const hydroShareBagUrl = (resource) => {
  // todo: this will only work if the bag has been generated
  return `https://www.hydroshare.org/hsapi/resource/${resource.id}/`
}

const getResourceMetadata = async (resourceId) => {
  const response = await fetch(`https://www.hydroshare.org/hsapi2/resource/${resourceId}/json/`)
  const metadata = await response.json()
  // add the resourceId to the metadata
  metadata.id = resourceId
  // also add the files in the resource
  metadata.notebooks = await notebooks_in_resource(resourceId)
  return metadata
}
</script>
