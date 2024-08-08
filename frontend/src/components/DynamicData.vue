<template>
  <v-sheet class="mx-auto" elevation="8">
    <v-card v-if="featureStore.activeFeature" height="100%">
      <v-card-item class="text-center">
        <v-card-title>{{ featureStore.activeFeature.properties.river_name }}</v-card-title>
        <v-card-subtitle>
          {{ featureStore.activeFeature.properties.reach_id }}
        </v-card-subtitle>
      </v-card-item>

      <v-card-text>
        <VariableSelect v-if="!hasResults()" />
        <v-btn v-if="!hasResults()" @click="query" color="primary" :loading="querying.hydrocron"
          >Query HydroCron</v-btn
        >
        <v-btn
          @click="getNodesInActiveReach"
          color="primary"
          class="ma-2"
          :loading="querying.nodes"
        >
          <v-icon :icon="mdiResistorNodes"></v-icon>Get Nodes
        </v-btn>
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
              <div
                v-for="swotFeature in featureStore.activeFeature.results.geojson.features"
                :key="swotFeature.index"
              >
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
</template>

<script setup>
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { useChartsStore } from '@/stores/charts'
import { mdiSatelliteVariant, mdiTimelineClockOutline, mdiResistorNodes } from '@mdi/js'
import { queryHydroCron, getNodesFromReach } from '../_helpers/hydroCron'
import VariableSelect from '@/components/VariableSelect.vue'

const featureStore = useFeaturesStore()
const chartsStore = useChartsStore()

let show = ref(false)

let querying = ref({ hydrocron: false, nodes: false })

const query = async () => {
  querying.value.hydrocron = true
  await queryHydroCron(featureStore.activeFeature)
  querying.value.hydrocron = false
}

const getNodesInActiveReach = async () => {
  querying.value.nodes = true
  const nodes = await getNodesFromReach(featureStore.activeFeature)
  console.log('Nodes', nodes)
  querying.value.nodes = false
}

const hasResults = () => {
  return featureStore?.activeFeature?.results !== undefined
}

const showPlot = () => {
  show.value = false
  chartsStore.showVis()
}
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
