<template>
  <v-container fluid>
    <h2>Notebooks</h2>
    <hr />
    <p class="content">
      This page provides example notebooks for interacting with SWOT data. The notebooks are hosted
      on HydroShare in a
      <a
        :href="`https://www.hydroshare.org/resource/${VITE_HYDROSHARE_NOTEBOOKS_COLLECTION}/`"
        target="_blank"
        >publicly available collection</a
      >.
    </p>
    <v-row v-if="resourcesMetadata.length === 0" class="mb-4">
      <v-col v-for="i in 3" :key="i" cols="12">
        <v-card class="mx-auto" variant="elevated" outlined>
          <v-card-item>
            <div>
              <v-skeleton-loader class="mx-auto" type="card" :loading="true" :height="200"
                :width="100"></v-skeleton-loader>
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else class="mb-4" dense>
      <v-col v-for="resource in resourcesMetadata" :key="resource.id">
        <v-card class="d-flex flex-column" variant="elevated" outlined height="100%">
          <v-card-item>
            <v-card-title>{{ resource.title }}</v-card-title>
            <v-card-subtitle>
              <v-chip v-for="creator in resource.creators" :key="creator" class="mr-2" label>{{ creator.name }}
              </v-chip>
            </v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-chip v-for="subject in resource.subjects" :key="subject" class="mr-1" small color="grey lighten-1"
              text-color="grey darken" style="font-size: 0.8em">
              {{ subject }}
            </v-chip>
            <div class="my-2">
              {{ resource.abstract }}
            </div>
            <div class="my-2" style="color: grey">
              {{ resource.citation }}
            </div>
            <div class="my-2">
              Rendered from HydroShare Resource:
              <a :href="`https://www.hydroshare.org/resource/${resource.id}/`" target="_blank">{{
                resource.id
              }}</a>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn v-if="resource.notebooks.length > 1">
              <v-tooltip activator="parent" location="bottom">
                View rendered copies at nbviewer.org
              </v-tooltip>
              <v-icon left>{{ mdiNotebook }}</v-icon>
              View
              <v-menu activator="parent">
                <v-list dense class="pa-0" style="width: 300px" max-height="400px" overflow-y="auto">
                  <v-list-item v-for="notebookUrl in resource.notebooks" :key="notebookUrl" :value="notebookUrl"
                    :href="nbviewer_url(notebookUrl)" target="_blank">
                    <v-list-item-title>
                      {{ notebookUrl.split('/').pop() }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-btn>
            <v-btn v-else :href="nbviewer_url(resource.notebooks[0])" target="_blank">
              <v-tooltip activator="parent" location="bottom">
                View a rendered copy at nbviewer.org
              </v-tooltip>
              <v-icon left>{{ mdiNotebook }}</v-icon>
              Preview
            </v-btn>
            <v-btn :href="hydroShareBagUrl(resource)" download>
              <v-icon left>{{ mdiDownloadBox }}</v-icon>
              Download
              <v-tooltip activator="parent" location="bottom">
                Download the full HydroShare resource including metadata
              </v-tooltip>
            </v-btn>
            <v-btn :href="cuahsi_jh_url(resource)" target="_blank">
              <v-icon left>{{ mdiRocketLaunch }}</v-icon>
              Launch in CUAHSI
              <v-tooltip activator="parent" location="bottom">
                Launch using CUAHSI JupyterHub
              </v-tooltip>
            </v-btn>
            <v-btn :href="binder_url(resource)" target="_blank" disabled>
              <v-icon left>{{ mdiLaunch }}</v-icon>
              Launch in MyBinder
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
import { computed, ref, onMounted } from 'vue'
import { mdiDownloadBox, mdiNotebook, mdiRocketLaunch, mdiLaunch } from '@mdi/js'
// TODO use the collection
// import { VITE_HYDROSHARE_NOTEBOOKS_COLLECTION } from '@/constants'
const VITE_HYDROSHARE_NOTEBOOKS_COLLECTION = 'ac6cc75dcb0146cf9cc17a974f4bb08b'

const resourcesMetadata = ref([])

// get a list of resource ids from the VITE_HYDROSHARE_NOTEBOOKS_COLLECTION
let resourceIds = []

onMounted(async () => {
  const hydroshare_json_endpoint = `https://www.hydroshare.org/hsapi2/resource/${VITE_HYDROSHARE_NOTEBOOKS_COLLECTION}/json/`

  resourceIds = await fetch(hydroshare_json_endpoint)
    .then((response) => response.json())
    .then((data) => {
      // get the resource ids from the collection
      resourceIds = data.relations.map((relation) => {
        // if relation.type = "This resource includes" then parse the resource id from the relation.value
        if (relation.type === 'This resource includes') {
          const regex = /\/resource\/([^/]+)/ // regex to match the resource id
          const match = relation.value.match(regex)
          if (match) {
            return match[1] // return the resource id
          }
        }
      })
      console.log('Found the following resources in the collection', resourceIds)
      return resourceIds
    })
    .catch((error) => {
      console.error('Error fetching collection JSON:', error)
    })

  // get the metadata for each resource id, using the HydroShare API
  resourcesMetadata.value = await Promise.all(
    resourceIds.map(async (resourceId) => {
      return await getResourceMetadata(resourceId)
    })
  )
  console.log('Collected the following resource metadata', resourcesMetadata.value)
})

// notebooks is an array of resource objects, each with metadata

const cuahsi_jh_url = (resource) =>
  `https://jupyterhub.cuahsi.org/hub/spawn?next=/user-redirect/nbfetch/hs-pull?id=${resource.id}`

const nbviewer_url = (notebookUrl) => {
  return `https://nbviewer.org/urls/${notebookUrl}`
}

const binder_url = (resource) => {
  return `https://mybinder.org/v2/hydroshare/${resource.id}`
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

<style scoped>
h2 {
  color: #2c3e50;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  font-family: 'Roboto', sans-serif;
  line-height: 1.6;
}

.content {
  font-family: 'Roboto', sans-serif;
  line-height: 1.6;
  color: #333;
  margin-bottom: 1.5em;
}
</style>
