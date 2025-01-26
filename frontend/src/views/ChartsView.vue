<template>
  <v-container v-if="hasData" fluid fill-height>
    <v-tabs v-model="chartStore.chartTab" align-tabs="center" fixed-tabs color="primary" grow>
      <v-tab value="timeseries">
        <v-icon :icon="mdiTimelineClock"></v-icon>
        Reach Averaged
      </v-tab>
      <v-tab value="distance">
        <v-icon :icon="mdiMapMarkerDistance"></v-icon>
        Node Profile
      </v-tab>
    </v-tabs>
    <TimeSeriesCharts v-if="chartStore.chartTab === 'timeseries'" />
    <DistanceCharts v-if="chartStore.chartTab === 'distance'" />
  </v-container>

  <v-container v-if="!hasData && !fetchingData">
    <v-sheet border="md" class="pa-6 mx-auto ma-4" max-width="1200" rounded>
      <span>
        You don't have any data to view yet. Use the
        <router-link :to="{ path: `/` }">Map</router-link> to make selections.
      </span>
    </v-sheet>
  </v-container>

  <v-container v-if="fetchingData">
    <h2 class="text-center ma-2">
      <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
      Loading data...
    </h2>
    <v-skeleton-loader height="70vh" type="image, divider, list-item-two-line" />
  </v-container>
</template>

<script setup>
import { useChartsStore } from '../stores/charts'
import { useFeaturesStore } from '../stores/features'
import { RouterLink, useRouter } from 'vue-router'
import { computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { mdiTimelineClock, mdiMapMarkerDistance } from '@mdi/js'
import TimeSeriesCharts from './TimeSeriesCharts.vue'
import DistanceCharts from './DistanceCharts.vue'
import { queryHydroCron, getNodeDataForReach } from '../_helpers/hydroCron'

// TODO: register chartjs globally
import { ChartJS } from '@/_helpers/charts/charts' // eslint-disable-line

const props = defineProps({ reachId: String })
const router = useRouter()

const chartStore = useChartsStore()
const featuresStore = useFeaturesStore()
const { querying, activeFeature, selectedFeatures } = storeToRefs(featuresStore)

// use a watcher to run the query once the active feature is set
// we do this because it seems that async queries from esri leaflet
// are not properly returning a promise to await
watch(activeFeature, async(newActiveFeature) => {
  if (newActiveFeature) {
    runQuery()
  }
})

onMounted(() => {
  if (activeFeature.value) {
    // set the reach id in the url from the active feature
    if (props.reachId === "") {
      router.replace({ params: { reachId: activeFeature.value.properties.reach_id } })
    }
    runQuery()
  }
  else if (props.reachId !== "") {
    querying.value.hydrocron = true
    console.log('Setting active feature by reach id', props.reachId)
    featuresStore.setActiveFeatureByReachId(props.reachId)
    
    // check for query params that determine the chartTab
    const query = router.currentRoute.value.query
    if (query.plot) {
      // check that the chartTab is valid
      if (query.plot === 'timeseries' || query.plot === 'distance') {
        chartStore.chartTab = query.plot
      }
    }
  }
})

const runQuery = async () => {
  querying.value.hydrocron = true
  await queryHydroCron(activeFeature.value)
  chartStore.buildChart(selectedFeatures.value)
  querying.value.hydrocron = false

  querying.value.nodes = true
  await getNodeDataForReach(activeFeature.value)
  querying.value.nodes = false
  chartStore.buildDistanceChart(featuresStore.nodes)
}

let hasData = computed(() => chartStore.chartData && chartStore.chartData.datasets?.length > 0)
let fetchingData = computed(() => !hasData.value && (querying.value.hydrocron || querying.value.nodes))
</script>
