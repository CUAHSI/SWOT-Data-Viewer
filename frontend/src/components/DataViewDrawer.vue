<template>
  <v-navigation-drawer location="right" width="auto" v-model="show" order="1">
    <v-btn v-if="featureStore.activeFeature" @click="show = !show"
    location="left"
    order="0"
    postition="absolute"
    :style="{ bottom: '30%', transform: translate() , position: 'absolute'}"
    :icon="show ? mdiChevronRight : mdiChevronLeft">
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
                <v-card-title>{{ getFeatureName() }}</v-card-title>
                <!-- <v-card-subtitle>
                  {{ featureStore.activeFeature.sword.reach_id }}
                </v-card-subtitle> -->
              </v-card-item>
              <v-card-text>
                <div v-for="metadataObject in defaultSwordMetadata(true)" :key="metadataObject.id">
                  <v-divider />
                  <div><strong>{{ metadataObject.short_definition }}:</strong> {{ metadataObject.value }}</div>
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
import { mdiTableEye, mdiSatelliteVariant, mdiTimelineClockOutline, mdiChevronRight, mdiChevronLeft } from '@mdi/js'
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

const defaultSwordMetadata = () => {
  if (!featureStore.activeFeature) return {}
  // TODO assumes reach, won't work for nodes
  return hydrologicStore.getSwordDescriptions(featureStore.activeFeature.sword, true, 'reach')
}

const getFeatureName = () => {
  if (!featureStore.activeFeature) return ''
  const river_name = featureStore.activeFeature.sword.river_name
  if (river_name === 'NODATA') {
    return 'UNNAMED REACH'
  }
  return river_name
}

const translate = () => {
  if (show.value) {
    return 'translate(-50%, 0)'
  } else {
    return 'translate(-170%, 0)'
  }
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

.v-navigation-drawer--mini-variant,
.v-navigation-drawer {
  overflow: visible !important;
}
</style>