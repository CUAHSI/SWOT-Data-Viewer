<template>
  <v-container v-if="chartStore.hasNodeData" fluid fill-height>
    <v-row>
      <v-col sm="2">
        <v-sheet class="elevation-1" color="input">
          <v-card-title> Variables </v-card-title>
          <v-tabs v-model="activePlt" direction="vertical" color="primary">
            <v-tab v-for="plt in chartStore.nodeCharts" :key="plt.abbreviation" :value="plt">
              <template v-if="lgAndUp">
                {{ plt.name }}
              </template>
              <template v-else>
                {{ plt.abbreviation }}
              </template>
              <v-tooltip activator="parent" location="start" max-width="300px">
                {{ plt.help }}
              </v-tooltip>
            </v-tab>
          </v-tabs>
        </v-sheet>
        <TimeRangeSelector />
        <v-divider v-if="lgAndUp" class="my-2" />
        <PlotOptions />
        <v-divider v-if="lgAndUp" class="my-2" />
        <DataQuality />
        <v-divider v-if="lgAndUp" class="my-2" />
        <PlotActions :chosen-plot="activeNodeChart" @reset-data="resetData" />
      </v-col>
      <v-divider v-if="lgAndUp" class="my-2" vertical />
      <v-col sm="10">
        <v-window v-model="activePlt">
          <v-window-item v-for="plt in chartStore.nodeCharts" :key="plt.abbreviation" :value="plt">
            <NodeChart
              v-if="plt"
              class="chart"
              :data="chartStore.nodeChartData"
              :chosen-plot="plt"
            />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
  <v-container v-else-if="fetchingData">
    <h2 class="text-center ma-2">
      <v-progress-circular :size="50" color="primary" indeterminate />
      Loading node level data...
    </h2>
    <v-skeleton-loader height="70vh" type="image, divider, list-item-two-line" />
  </v-container>
  <v-container v-else>
    <v-sheet border="md" class="pa-6 mx-auto ma-4" max-width="1200" rounded>
      <span>
        No node level data available for the selected feature. Please select a different feature
        from the
        <router-link :to="{ path: `/` }">Map</router-link>. Or view
        <a href="" @click="goToTimeSeriesPlot">reach-averaged plots.</a>
      </span>
    </v-sheet>
  </v-container>
</template>

<script setup>
import NodeChart from '@/components/NodeChart.vue'
import { useChartsStore } from '../stores/charts'
import { useFeaturesStore } from '../stores/features'
import { onMounted, computed } from 'vue'
import { useDisplay } from 'vuetify'
import PlotOptions from '@/components/PlotOptions.vue'
import PlotActions from '@/components/PlotActions.vue'
import DataQuality from '@/components/DataQuality.vue'
import TimeRangeSelector from '@/components/TimeRangeSelector.vue'
import { storeToRefs } from 'pinia'

const { lgAndUp } = useDisplay()
const chartStore = useChartsStore()
const featuresStore = useFeaturesStore()

const { activePlt, activeNodeChart, nodeChartData, chartTab } = storeToRefs(chartStore)
const { querying } = storeToRefs(featuresStore)

onMounted(() => {})

const resetData = () => {
  activeNodeChart.value.chart.data.datasets = nodeChartData.value.datasets
  activeNodeChart.value.chart.update()
}

let fetchingData = computed(() => querying.value.nodes)

const goToTimeSeriesPlot = (e) => {
  e.preventDefault()
  chartTab.value = 'timeseries'
}
</script>

<style scoped>
.chart {
  height: 100%;
}
</style>
