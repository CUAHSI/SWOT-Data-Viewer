<template>
  <v-btn v-if="!hasData" @click="query" color="primary" :loading="querying.hydrocron"
    >Query HydroCron</v-btn
  >
  <v-sheet v-if="hasData" class="mx-auto" elevation="8">
    <v-card v-if="featureStore.activeFeature" height="100%">
      <v-expansion-panels v-if="hasData">
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
      <TimeSeriesCharts v-if="hasData" />
    </v-card>
  </v-sheet>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { useChartsStore } from '@/stores/charts'
import { mdiSatelliteVariant, mdiTimelineClockOutline } from '@mdi/js'
import { queryHydroCron } from '../_helpers/hydroCron'
import TimeSeriesCharts from '../views/TimeSeriesCharts.vue'

// TODO: register chartjs globally
import { ChartJS } from '@/_helpers/charts/charts' // eslint-disable-line

const featureStore = useFeaturesStore()
const chartStore = useChartsStore()

let querying = ref({ hydrocron: false, nodes: false })
let hasData = computed(() => chartStore.chartData && chartStore.chartData.datasets?.length > 0)

onMounted(() => {
  // query()
})
const query = async () => {
  querying.value.hydrocron = true
  await queryHydroCron(featureStore.activeFeature)
  chartStore.buildChart(featureStore.selectedFeatures)
  querying.value.hydrocron = false
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
