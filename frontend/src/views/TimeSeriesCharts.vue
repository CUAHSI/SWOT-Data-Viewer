<template>
  <v-container v-if="hasData" fluid fill-height>
    <v-row>
      <v-col sm="2">
        <v-card class="elevation-1" color="input">
          <v-card-title> Variables </v-card-title>
          <v-tabs v-model="activePlt" direction="vertical" color="primary">
            <v-tab v-for="plt in timeSeriesCharts" :key="plt.abbreviation" :value="plt">
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
        <v-divider v-if="lgAndUp" class="my-2" />
        <PlotOptions />
        <v-divider v-if="lgAndUp" class="my-2" />
        <DataQuality />
        <v-divider v-if="lgAndUp" class="my-2" />
        <PlotActions :chosen-plot="activeReachChart" />
      </v-col>
      <v-divider v-if="lgAndUp" class="my-2" vertical />
      <v-col sm="10">
        <v-window v-model="activePlt">
          <v-window-item v-for="plt in timeSeriesCharts" :key="plt.abbreviation" :value="plt">
            <LineChart v-if="plt" class="chart" :data="chartStore.chartData" :chosen-plot="plt" />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import LineChart from '@/components/LineChart.vue'
import PlotOptions from '@/components/PlotOptions.vue'
import PlotActions from '../components/PlotActions.vue'
import DataQuality from '@/components/DataQuality.vue'
import TimeRangeSelector from '@/components/TimeRangeSelector.vue'
import { useChartsStore } from '../stores/charts'
import { useFeaturesStore } from '@/stores/features'
import { useDisplay } from 'vuetify'
import { onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'

const { lgAndUp } = useDisplay()
const chartStore = useChartsStore()
const featuresStore = useFeaturesStore()

const { activePlt, activeReachChart, reachCharts, lakeCharts } = storeToRefs(chartStore)
const { activeFeature } = storeToRefs(featuresStore)

let hasData = computed(() => chartStore.chartData && chartStore.chartData.datasets?.length > 0)

let timeSeriesCharts = computed(() => {
  // decide which charts to show based on feature type
  if (activeFeature.value?.feature_type === 'PriorLake') {
    return lakeCharts.value
  }
  return reachCharts.value
})

onMounted(() => {})
</script>

<style scoped>
.chart {
  height: 100%;
}
</style>
