<template>
  <template v-if="activeFeatureIsReach">
    <v-container fluid fill-height>
      <v-tabs v-model="chartStore.chartTab" align-tabs="center" fixed-tabs color="primary" grow>
        <v-tab value="timeseries">
          <v-icon :icon="mdiTimelineClock" />
          Reach Averaged
        </v-tab>
        <v-tab value="distance">
          <v-icon :icon="mdiMapMarkerDistance" />
          Node Profile
        </v-tab>
      </v-tabs>
      <template v-if="chartStore.chartTab === 'timeseries'">
        <v-container v-if="querying.hydrocron">
          <h2 class="text-center ma-2">
            <v-progress-circular :size="50" color="primary" indeterminate />
            Loading Reach data...
          </h2>
          <v-skeleton-loader height="70vh" type="image, divider, list-item-two-line" />
        </v-container>
        <TimeSeriesCharts v-else-if="hasReachData" />
        <v-container v-else>
          <h2 class="text-center ma-2">
            No reach level data available for this reach. Use the
            <router-link :to="{ path: `/` }"> Map </router-link> to select a different reach.
          </h2>
        </v-container>
      </template>
      <template v-if="chartStore.chartTab === 'distance'">
        <DistanceCharts v-if="hasNodeData" />
        <v-container v-if="querying.nodes">
          <h2 class="text-center ma-2">
            <v-progress-circular :size="50" color="primary" indeterminate />
            Loading Node data...
          </h2>
          <v-skeleton-loader height="70vh" type="image, divider, list-item-two-line" />
        </v-container>
        <v-container v-else>
          <h2 class="text-center ma-2">
            No node data available for this reach. Use the
            <router-link :to="{ path: `/` }"> Map </router-link> to make selections, or
            <a href="#" @click.prevent="chartStore.chartTab = 'timeseries'"
              >view the reach-averaged plots</a
            >.
          </h2>
        </v-container>
      </template>
    </v-container>
  </template>
  <template v-else>
    <v-container>
      <v-sheet border="md" class="pa-6 mx-auto ma-4" max-width="1200" rounded>
        <span v-if="!hasData && !fetchingData">
          You don't have any data to view yet. Use the
          <router-link :to="{ path: `/` }">Map</router-link> to make selections.
        </span>
        <span v-else>
          Plots are only available for reaches. Use the
          <router-link :to="{ path: `/` }">Map</router-link> to select a reach.
        </span>
      </v-sheet>
    </v-container>
  </template>
</template>

<script setup>
import { useChartsStore } from '../stores/charts'
import { useStatsStore } from '../stores/stats'
import { useFeaturesStore } from '../stores/features'
import { useMapStore } from '../stores/map'
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
const statsStore = useStatsStore()
const mapStore = useMapStore()
const { querying, activeFeature, selectedFeatures } = storeToRefs(featuresStore)
const { showStatistics } = storeToRefs(chartStore)

// use a watcher to run the query once the active feature is set
// we do this because it seems that async queries from esri leaflet
// are not properly returning a promise to await
watch(activeFeature, async (newActiveFeature) => {
  if (newActiveFeature) {
    runQuery()
  }
})

onMounted(async () => {
  mapStore.generateReachesFeatures()
  if (activeFeature.value) {
    // set the reach id in the url from the active feature
    if (props.reachId === '') {
      router.replace({ params: { reachId: activeFeature.value.properties.reach_id } })
    }
    runQuery()
  }
  const currentRoute = router.currentRoute.value
  chartStore.checkQueryParams(currentRoute)
  if (props.reachId !== '') {
    querying.value.hydrocron = true
    featuresStore.setActiveFeatureById(props.reachId)
  }
})

const runQuery = async () => {
  querying.value.hydrocron = true
  await queryHydroCron(activeFeature.value)
  querying.value.hydrocron = false
  chartStore.buildChart(selectedFeatures.value)
  if (!hasReachData.value) {
    return
  }

  querying.value.nodes = true
  await getNodeDataForReach(activeFeature.value)

  // check to see if any node data were actually found
  if (hasNodeData.value) {
    chartStore.buildDistanceChart(featuresStore.nodes)
    // show stats if they are enabled
    statsStore.toggleSeriesStatistics(showStatistics.value)
    chartStore.hasNodeData = true
  } else {
    chartStore.hasNodeData = false
  }
  querying.value.nodes = false
}

let hasReachData = computed(() => chartStore.chartData && chartStore.chartData.datasets?.length > 0)
let hasNodeData = computed(
  () => chartStore.nodeChartData && chartStore.nodeChartData.datasets?.length > 0
)
let activeFeatureIsReach = computed(() => {
  return activeFeature.value && activeFeature.value.feature_type.toLowerCase() === 'reach'
})
</script>
