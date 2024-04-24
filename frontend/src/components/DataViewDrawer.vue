<template>
  <v-navigation-drawer location="right" width="auto" v-model="show" temporary>
    <v-btn v-if="!show && featureStore.activeFeature" size="large" color="primary" class="ma-0 pa-2 drawer-handle"
      @click="show = !show" :style="{ bottom: '30%', transform: 'translate(-135%, 0)', position: 'absolute' }">
      <v-icon :icon="mdiTableEye"></v-icon>
      <span style="white-space: normal;">Explore Data</span>
    </v-btn>
    <v-container v-if="featureStore.activeFeature">
      <v-tabs v-model="tab" align-tabs="center">
        <v-tab :value="1">
          Static SWORD Metadata
        </v-tab>
        <v-tab :value="2">
          Query dynamic variables
        </v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item :value="1">
          <v-sheet class="mx-auto" elevation="8">
            <v-card v-if="featureStore.activeFeature" height="100%">
              <v-card-item class="text-center">
                <v-card-title>{{ featureStore.activeFeature.sword.river_name }}</v-card-title>
                <v-card-subtitle>
                  {{ featureStore.activeFeature.sword.reach_id }}
                </v-card-subtitle>
              </v-card-item>
              <v-card-text>
                <div v-for="(value, key, i) in featureStore.activeFeature.sword" :key="i">
                  <v-divider v-if="i < Object.keys(featureStore.activeFeature.sword).length - 1" />
                  <div><strong>{{ hydrologicStore.getSwordDescription(key) }}:</strong> {{ value }}</div>
                </div>
              </v-card-text>
            </v-card>
          </v-sheet>
        </v-window-item>

        <v-window-item :value="2">
          <v-sheet class="mx-auto" elevation="8">
            <v-card v-if="featureStore.activeFeature" height="100%">
              <v-card-item class="text-center">
                <v-card-title>{{ featureStore.activeFeature.sword.river_name }}</v-card-title>
                <v-card-subtitle>
                  {{ featureStore.activeFeature.sword.reach_id }}
                </v-card-subtitle>
              </v-card-item>

              <v-card-text>
                <VariableSelect v-if="!hasResults()" />
                <v-btn v-if="!hasResults()" @click="query" color="primary" :loading="querying">Query HydroCron</v-btn>
                <v-expansion-panels v-if="hasResults()">
                  <v-expansion-panel>
                    <v-expansion-panel-title>
                      <v-icon :icon="mdiTimelineClockOutline"></v-icon>
                      <span class="ml-2">HydroCron Query</span>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <div v-for="(value, key, i) in featureStore.activeFeature.params" :key="i">
                        <v-divider v-if="i < Object.keys(featureStore.activeFeature.params).length - 1" />
                        <div>{{ key }}: {{ value }}</div>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-title>
                      <v-icon :icon="mdiSatelliteVariant"></v-icon>
                      <span class="ml-2">SWOT Data ({{ featureStore.activeFeature.hits }} points)</span>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <div v-for="swotFeature in featureStore.activeFeature.results.geojson.features"
                        :key="swotFeature.index">
                        <div v-for="(value, key, i) in swotFeature.properties" :key="i">
                          <v-divider v-if="i < Object.keys(swotFeature.properties).length - 1" />
                          <div>{{ key }}: {{ value }}</div>
                        </div>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
                <v-btn @click="showPlot" v-if="hasResults()">Show Plot</v-btn>
              </v-card-text>
            </v-card>
          </v-sheet>
        </v-window-item>
      </v-window>
    </v-container>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { useChartsStore } from '@/stores/charts'
import { useHydrologicStore } from '@/stores/hydrologic'
import { mdiTableEye, mdiSatelliteVariant, mdiTimelineClockOutline } from '@mdi/js'
import { queryHydroCron } from "../_helpers/hydroCron";
import VariableSelect from '@/components/VariableSelect.vue'

const featureStore = useFeaturesStore()
const chartsStore = useChartsStore()
const hydrologicStore = useHydrologicStore()

let show = ref(false)
let tab = ref(1)

let querying = ref(false)

const query = async () => {
  querying.value = true
  await queryHydroCron(featureStore.activeFeature)
  querying.value = false
}

const hasResults = () => {
  return featureStore?.activeFeature?.results !== undefined
}

const showPlot = () => {
  show.value = false
  chartsStore.showVis()
}

featureStore.$subscribe((mutation, state) => {
  if (state.activeFeature !== null) {
    // && typeof mutation.events.newValue === 'object'
    show.value = true
  }
})

</script>


<style scoped>
#chart {
  height: 40vh;
}
</style>