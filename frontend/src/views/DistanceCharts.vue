<template>
  <v-container v-if="chartStore.hasNodeData" fluid fill-height>
    <v-row>
      <v-col sm="2">
        <v-sheet class="elevation-1" color="input">
          <v-card-title> Variables </v-card-title>
          <v-tabs v-model="activePlt" direction="vertical" color="primary" @update:model-value="changePlot">
            <v-tab v-for="plt in chartStore.nodeCharts" :value="plt" :key="plt.abbreviation">
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
        <TimeRangeSelector/>
        <v-divider class="my-2" v-if="lgAndUp"></v-divider>
        <PlotOptions />
        <v-divider class="my-2" v-if="lgAndUp"></v-divider>
        <DataQuality />
        <v-divider class="my-2" v-if="lgAndUp"></v-divider>
        <PlotActions :chosenPlot="activeNodeChart" @reset-data="resetData"/>
      </v-col>
      <v-divider class="my-2" vertical v-if="lgAndUp"></v-divider>
      <v-col sm="10">
        <v-window v-model="activePlt">
          <v-window-item
            v-for="plt in chartStore.nodeCharts"
            :key="plt.abbreviation"
            :value="plt"
          >
            <NodeChart
              v-if="plt"
              class="chart"
              :data="chartStore.nodeChartData"
              :chosenPlot="plt"
            />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
  <v-container v-else>
    <h2 class="text-center ma-2">
      <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
      Loading node level data...
    </h2>
    <v-skeleton-loader height="70vh" type="image, divider, list-item-two-line" />
  </v-container>
</template>

<script setup>
import NodeChart from '@/components/NodeChart.vue'
import { useChartsStore } from '../stores/charts'
import { onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import PlotOptions from '@/components/PlotOptions.vue'
import PlotActions from '@/components/PlotActions.vue'
import DataQuality from '@/components/DataQuality.vue'
import TimeRangeSelector from '@/components/TimeRangeSelector.vue'
import { storeToRefs } from 'pinia'

const { lgAndUp } = useDisplay()
const chartStore = useChartsStore()
const router = useRouter()

const { activePlt, activeNodeChart, nodeChartData } = storeToRefs(chartStore)

onMounted(() => {
  // check for query params that determine the activePlt
  const query = router.currentRoute.value.query
  if (query.variables) {
    const plt = chartStore.nodeCharts.find((plt) => plt.abbreviation === query.variables)
    if (plt) {
      activePlt.value = plt
    }
  }
})

const changePlot = (plt) => {
  // re-sort the chart data by the x-axis variable
  // before rending the chart. Set the sorted data
  // to the active data in the chart prior to rendering
  const {chartData} = storeToRefs(chartStore)
  chartData.value.datasets[0].data = chartStore.sortChartByX(plt)

  // force a re-render of the line charts
  chartStore.updateShowLine()

  router.push({ query: { ...router.currentRoute.value.query, variables: plt.abbreviation } })
}

const resetData = () => {
  activeNodeChart.value.chart.data.datasets = nodeChartData.value.datasets
  activeNodeChart.value.chart.update()
}

</script>

<style scoped>
.chart {
  height: 100%;
}
</style>
