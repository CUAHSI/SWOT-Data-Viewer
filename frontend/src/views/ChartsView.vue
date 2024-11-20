<template>
  <v-container v-if="hasChartData" fluid fill-height>
    <v-tabs v-model="chartStore.chartTab" align-tabs="center" fixed-tabs color="primary" grow @update:model-value="changePlotType">
      <v-tab value="timeseries">
        <v-icon :icon="mdiTimelineClock"></v-icon>
        Reach Timeseries
      </v-tab>
      <v-tab value="distance">
        <v-icon :icon="mdiMapMarkerDistance"></v-icon>
        Node Profile
      </v-tab>
    </v-tabs>
    <TimeSeriesCharts v-if="chartStore.chartTab === 'timeseries'" />
    <DistanceCharts v-if="chartStore.chartTab === 'distance'" />
  </v-container>

  <v-container v-if="!hasChartData && !fetchingData">
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
import { computed, watch, onMounted, nextTick } from 'vue'
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
    runHydrocronQuery()
  }
})

onMounted(() => {
  if (activeFeature.value) {
    // set the reach id in the url from the active feature
    if (props.reachId === "") {
      router.replace({ params: { reachId: activeFeature.value.properties.reach_id } })
    }else{
      // check that the activeFeature matches the reachId prop
      // if not, the reachId prop takes precedence
      if (activeFeature.value.properties.reach_id !== Number(props.reachId)) {
        featuresStore.setActiveFeatureByReachId(props.reachId)
      }
    }
    runHydrocronQuery()
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

const changePlotType = (plot) => {
  router.push({ query: { plot } })
}

const runHydrocronQuery = async () => {
  // we check to see if we already have data for this feature
  // TODO: cam482 we should check not only for activeFeature.value.queries,
  // but also if there are data in any matching selectedFeatures

  // also in addition to seeing if queries exist, 
  // we should make sure that the data is complete
  // for instance if browser was refreshed during fetch

  const query_completed_date = activeFeature.value.query_completed_date
  if (!query_completed_date || 
    activeFeature.value?.queries == undefined ||
    query_completed_date < Date.now() - 604800000) {
    console.log('Missing or stale reach data, running query')
    querying.value.hydrocron = true
    await queryHydroCron(activeFeature.value)
    querying.value.hydrocron = false
    chartStore.buildChart(selectedFeatures.value)
  }

  const runNodeQuery = async () => {
    querying.value.nodes = true
    await getNodeDataForReach(activeFeature.value)
    querying.value.nodes = false
    chartStore.buildDistanceChart(featuresStore.nodes)
  }
  // every activeFeature.value.nodes should have a queries_completed_date
  // check that all of these queries_completed_date are within the last week
  const nodes = activeFeature.value?.nodes
  if (nodes == undefined || nodes.length == 0) {
    console.log('No nodes data found, running query')
    await runNodeQuery()
  }else{
    let shouldRunQuery = false
    console.log('Found existing nodes data, checking how recent they are')
    nodes.forEach(async (node) => {
      if (!node.query_completed_date || 
        node.query_completed_date < Date.now() - 604800000) {
        shouldRunQuery = true
      }
    })
    if (shouldRunQuery) {
      console.log('Nodes data is stale, running query')
      await runNodeQuery()
    }
  }

  // check the case that we have complete data, but the chart is not built
  await nextTick()
  if (!hasChartData.value) {
    console.log('Building chart')
    chartStore.buildChart(selectedFeatures.value)
    chartStore.buildDistanceChart(featuresStore.nodes)
  }
}

let hasChartData = computed(() => chartStore.chartData && chartStore.chartData.datasets?.length > 0)
let fetchingData = computed(() => !hasChartData.value && (querying.value.hydrocron || querying.value.nodes))
</script>
