<template>
  <v-btn v-if="!hasChartData" color="primary" :loading="querying.hydrocron" @click="query">
    Query HydroCron
  </v-btn>
  <v-sheet v-if="hasChartData" class="mx-auto" elevation="8">
    <v-card v-if="featureStore.activeFeature" height="100%">
      <v-expansion-panels v-if="hasChartData">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon :icon="mdiTimelineClockOutline" />
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
            <v-icon :icon="mdiSatelliteVariant" />
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
      <TimeSeriesCharts v-if="hasChartData" />
    </v-card>
  </v-sheet>
  <v-sheet v-if="!hasChartData && lakeData" class="mx-auto" elevation="8">
    <v-card>
      <v-card-item class="text-center">
        <v-card-title>Lake Data</v-card-title>
      </v-card-item>
      <v-card-text>
        <pre>{{ lakeData }}</pre>
      </v-card-text>
    </v-card>
  </v-sheet>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { useChartsStore } from '@/stores/charts'
import { mdiSatelliteVariant, mdiTimelineClockOutline } from '@mdi/js'
import { queryHydroCron } from '../_helpers/hydroCron'
import TimeSeriesCharts from '../views/TimeSeriesCharts.vue'

// TODO: register chartjs globally
import { ChartJS } from '@/_helpers/charts/charts' // eslint-disable-line

const featureStore = useFeaturesStore()
const chartStore = useChartsStore()
const lakeData = ref(null)

let querying = ref({ hydrocron: false, nodes: false })
let hasChartData = computed(() => chartStore.chartData && chartStore.chartData.datasets?.length > 0)

const query = async () => {
  querying.value.hydrocron = true
  const response = await queryHydroCron(featureStore.activeFeature)
  // only build the chart if the feature is a reach for now
  if (featureStore?.activeFeature?.feature_type?.toLowerCase() === 'reach') {
    chartStore.buildChart(featureStore.selectedFeatures)
  } else {
    lakeData.value = response
  }
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
