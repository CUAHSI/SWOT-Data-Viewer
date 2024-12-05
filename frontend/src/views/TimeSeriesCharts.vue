<template>
  <v-container v-if="hasData" fluid fill-height>
    <v-row>
      <v-col sm="2">
        <v-card class="elevation-1" color="input">
          <v-card-title> Variables </v-card-title>
          <v-tabs v-model="activePlt" direction="vertical" color="primary" @update:model-value="changePlot">
            <v-tab
              v-for="plt in chartStore.reachCharts"
              :value="plt"
              :key="plt.abbreviation"
            >
              <template v-if="lgAndUp">
                {{ plt.name }}
              </template>
              <template v-else>
                {{ plt.abbreviation }}
              </template>
              <v-tooltip activator="parent" location="start" max-width="300px">
                {{ plt.help }}
              </v-tooltip
            >
            </v-tab>
          </v-tabs>
        </v-card>
        <v-divider class="my-2" v-if="lgAndUp"></v-divider>
        <PlotOptions />
      </v-col>
      <v-divider class="my-2" vertical v-if="lgAndUp"></v-divider>
      <v-col sm="10">
        <v-window v-model="activePlt">
          <v-window-item
            v-for="plt in chartStore.reachCharts"
            :key="plt.abbreviation"
            :value="plt"
          >
            <LineChart
              v-if="plt"
              class="chart"
              :data="chartStore.chartData"
              :chosenPlot="plt"
            />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import LineChart from '@/components/LineChart.vue'
import PlotOptions from '@/components/PlotOptions.vue'
import { useChartsStore } from '../stores/charts'
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

const { lgAndUp } = useDisplay()
const chartStore = useChartsStore()
const router = useRouter()

let hasData = computed(() => chartStore.chartData && chartStore.chartData.datasets?.length > 0)
const { activePlt } = storeToRefs(chartStore)

onMounted(() => {
  // check for query params that determine the pltTab
  const query = router.currentRoute.value.query
  if (query.variables) {
    const plt = chartStore.reachCharts.find((plt) => plt.abbreviation === query.variables)
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

</script>

<style scoped>
.chart {
  height: 100%;
}
</style>
