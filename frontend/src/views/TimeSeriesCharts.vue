<template>
  <v-container v-if="hasData" fluid fill-height>
    <v-row>
      <v-col sm="2">
        <v-card class="elevation-1" color="input">
          <v-card-title> Variables </v-card-title>
          <v-tabs v-model="activePlt" direction="vertical" color="primary">
            <v-tab v-for="plt in chartStore.reachCharts" :value="plt" :key="plt.abbreviation">
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
        </v-card>
        <TimeRangeSelector />
        <v-divider class="my-2" v-if="lgAndUp"></v-divider>
        <PlotOptions />
        <v-divider class="my-2" v-if="lgAndUp"></v-divider>
        <DataQuality />
        <v-divider class="my-2" v-if="lgAndUp"></v-divider>
        <PlotActions :chosenPlot="activeReachChart" />
      </v-col>
      <v-divider class="my-2" vertical v-if="lgAndUp"></v-divider>
      <v-col sm="10">
        <v-window v-model="activePlt">
          <v-window-item v-for="plt in chartStore.reachCharts" :key="plt.abbreviation" :value="plt">
            <LineChart v-if="plt" class="chart" :data="chartStore.chartData" :chosenPlot="plt" />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
  <v-container v-else>
    <h2 class="text-center ma-2">No data available for this reach.</h2>
    <v-skeleton-loader height="70vh" type="image, divider, list-item-two-line" />
  </v-container>
</template>

<script setup>
import LineChart from '@/components/LineChart.vue'
import PlotOptions from '@/components/PlotOptions.vue'
import PlotActions from '../components/PlotActions.vue'
import DataQuality from '@/components/DataQuality.vue'
import TimeRangeSelector from '@/components/TimeRangeSelector.vue'
import { useChartsStore } from '../stores/charts'
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

const { lgAndUp } = useDisplay()
const chartStore = useChartsStore()

let hasData = computed(() => chartStore.chartData && chartStore.chartData.datasets?.length > 0)
const { activePlt, activeReachChart } = storeToRefs(chartStore)

onMounted(() => {})
</script>

<style scoped>
.chart {
  height: 100%;
}
</style>
