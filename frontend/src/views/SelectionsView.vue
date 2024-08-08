<template>
  <h2 class="ma-2 text-center">Selected Features</h2>

  <v-container v-if="!hasFeatures">
    <v-sheet border="md" class="pa-6 mx-auto ma-4" max-width="1200" rounded>
      <span>
        You don't have any selections yet. Use the
        <router-link :to="{ path: `/` }">Map</router-link> to make selections.
      </span>
    </v-sheet>
  </v-container>

  <v-container v-if="hasFeatures">
    <v-tabs v-model="tab" align-tabs="center">
      <v-tab :value="1">Table View</v-tab>
      <v-tab :value="2">Card View</v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item :value="1" :key="1">
        <v-data-table :headers="headers" :items="featureStore.selectedFeatures" :sort-by="sortBy">
          <template v-slot:item.actions="{ item }">
            <v-tooltip text="Download SWOT JSON">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  :icon="mdiCodeJson"
                  size="small"
                  @click="downloadFeatureJson(item)"
                ></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Download SWOT CSV">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  :icon="mdiFileDelimited"
                  size="small"
                  @click="downloadCsv(item)"
                ></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="HydroCron Result">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  :icon="mdiSatelliteVariant"
                  size="small"
                  @click="viewHydroCronResult(item)"
                ></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="SWORD Info">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  :icon="mdiSword"
                  size="small"
                  @click="viewSwordInfo(item)"
                ></v-btn>
              </template>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-window-item>
      <v-window-item :value="2" :key="2">
        <v-row align="center" justify="center">
          <v-col v-for="(feature, i) in featureStore.selectedFeatures" :key="i" cols="auto">
            <v-card class="mx-auto" variant="elevated" outlined>
              <v-card-item>
                <div>
                  <div class="text-overline mb-1">
                    {{ variant }}
                  </div>
                  <v-card-title>{{ feature.properties.river_name }}</v-card-title>
                  <v-card-subtitle>
                    {{ feature.sword.reach_id }}
                  </v-card-subtitle>
                </div>
              </v-card-item>

              <v-card-text>
                <v-expansion-panels>
                  <v-expansion-panel>
                    <v-expansion-panel-title>
                      <div>SWORD Info</div>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <div v-for="(value, key, i) in feature.sword" :key="i">
                        <v-divider v-if="i < Object.keys(feature.sword).length - 1" />
                        <div>{{ key }}: {{ value }}</div>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-title>
                      <div>HydroCron Query</div>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <div v-for="(value, key, i) in feature.params" :key="i">
                        <v-divider v-if="i < Object.keys(feature.params).length - 1" />
                        <div>{{ key }}: {{ value }}</div>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-title>
                      <div>SWOT Data ({{ feature.hits }} points)</div>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <div v-for="feature in feature.results.geojson.features" :key="feature.index">
                        <div v-for="(value, key, i) in feature.properties" :key="i">
                          <v-divider v-if="i < Object.keys(feature.properties).length - 1" />
                          <div>{{ key }}: {{ value }}</div>
                        </div>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>
              <v-card-actions>
                <v-tooltip text="Download SWOT JSON">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      :icon="mdiCodeJson"
                      size="small"
                      @click="downloadFeatureJson(feature)"
                    ></v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="Download SWOT CSV">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      :icon="mdiFileDelimited"
                      size="small"
                      @click="downloadCsv(feature)"
                    ></v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="HydroCron Result">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      :icon="mdiSatelliteVariant"
                      size="small"
                      @click="viewHydroCronResult(feature)"
                    ></v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="SWORD Info">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      :icon="mdiSword"
                      size="small"
                      @click="viewSwordInfo(feature)"
                    ></v-btn>
                  </template>
                </v-tooltip>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
  </v-container>

  <v-bottom-sheet v-model="sheetText" inset>
    <v-card class="text-center" height="100%">
      <v-card-text>
        <v-btn @click="sheetText = null"> close </v-btn>

        <br />
        <br />

        <div>
          {{ sheetText }}
        </div>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup>
import { useFeaturesStore } from '../stores/features'
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { mdiSatelliteVariant, mdiSword, mdiCodeJson, mdiFileDelimited } from '@mdi/js'
import { computed } from 'vue'
import { downloadFeatureJson, downloadCsv } from '../_helpers/hydroCron'

const featureStore = useFeaturesStore()

let sheetText = ref(null)

let tab = ref(1)

let hasFeatures = computed(() => featureStore.selectedFeatures.length > 0)

const headers = [
  { title: 'Feature type', key: 'feature_type', value: (item) => item.params.feature },
  { title: 'Reach ID', key: 'reach_id', value: (item) => item.sword.reach_id },
  { title: 'River name', key: 'river_name', value: (item) => item.sword.river_name },
  { title: 'Start time', key: 'start_time', value: (item) => item.params.start_time },
  { title: 'End time', key: 'end_time', value: (item) => item.params.end_time },
  { title: 'Actions', key: 'actions', sortable: false }
  // { title: 'SWOT Time String', key: 'time_str', value: item => item.results.geojson }
]
const sortBy = [{ key: 'startedAt', order: 'desc' }]

async function viewHydroCronResult(feature) {
  const info = feature.results.geojson
  console.log(info)
  sheetText.value = JSON.stringify(info)
}

async function viewSwordInfo(feature) {
  const info = feature.sword
  console.log(info)
  sheetText.value = JSON.stringify(info)
}
</script>
