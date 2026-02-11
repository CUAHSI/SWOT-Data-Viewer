<template>
  <template v-if="activeFeature || fetchingData">
    <template v-if="hasData">
      <v-container v-if="!activeIsLake" fluid fill-height>
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
        <TimeSeriesCharts v-if="chartStore.chartTab === 'timeseries'" />
        <DistanceCharts v-if="chartStore.chartTab === 'distance'" />
      </v-container>
      <v-container v-else fluid fill-height>
        <TimeSeriesCharts />
      </v-container>
    </template>
    <template v-else>
      <v-container v-if="fetchingData">
        <h2 class="text-center ma-2">
          <v-progress-circular :size="50" color="primary" indeterminate />
          Loading data...
        </h2>
        <v-skeleton-loader height="70vh" type="image, divider, list-item-two-line" />
      </v-container>
      <v-container v-else>
        <v-sheet border="md" class="pa-6 mx-auto ma-4" max-width="1200" rounded>
          <span>
            No data available for the selected feature. Please select a different feature from the
            <router-link :to="{ path: `/` }">Map</router-link>.
          </span>
        </v-sheet>
      </v-container>
    </template>
  </template>
  <template v-else>
    <v-container>
      <v-sheet border="md" class="pa-6 mx-auto ma-4" max-width="1200" rounded>
        <span>
          You don't have any data to view yet. Use the
          <router-link :to="{ path: `/` }">Map</router-link> to make selections.
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

const props = defineProps({ featureId: String })
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
    // set the feature id in the url from the active feature
    if (props.featureId === '') {
      router.replace({ params: { featureId: activeFeature.value.properties.feature_id } })
    }
    runQuery()
  }
  const currentRoute = router.currentRoute.value
  chartStore.checkQueryParams(currentRoute)
  if (props.featureId !== '') {
    querying.value.hydrocron = true
    featuresStore.setActiveFeatureById(props.featureId)
  }
})

const runQuery = async () => {
  querying.value.hydrocron = true
  await queryHydroCron(activeFeature.value)

  // check to see if the swordfeature has an queries
  if (!activeFeature.value.queries || activeFeature.value.queries.length === 0) {
    querying.value.hydrocron = false
    return
  }

  chartStore.buildChart(selectedFeatures.value)
  querying.value.hydrocron = false

  // only get node data if the feature is a reach
  if (activeIsLake.value) {
    return
  }
  querying.value.nodes = true
  await getNodeDataForReach(activeFeature.value)
  querying.value.nodes = false
  chartStore.buildDistanceChart(featuresStore.nodes)
  // show stats if they are enabled
  statsStore.toggleSeriesStatistics(showStatistics.value)
}

let hasData = computed(() => chartStore.chartData && chartStore.chartData.datasets?.length > 0)
let fetchingData = computed(
  () => !hasData.value && (querying.value.hydrocron || querying.value.nodes)
)
let activeIsLake = computed(() => activeFeature.value?.feature_type.toLowerCase() === 'priorlake')
</script>
