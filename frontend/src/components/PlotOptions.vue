<template>
  <v-expansion-panels with="100%" multiple>
    <v-expansion-panel value="plotOptions">
      <v-expansion-panel-title>Plot Options</v-expansion-panel-title>
      <v-expansion-panel-text>
        <DataQuality
          id="dataQuality"
        />
        <StatisticsToggle v-if="chartStore.chartTab === 'distance'" />
        <v-select
          label="Plot Style"
          v-model="showLine"
          :items="[{title: 'Scatter', value: false}, {title: 'Connected', value: true}]"
          @update:modelValue="chartStore.updateShowLine"
        ></v-select>
        <v-sheet class="pa-2" color="input">
          <TimeRangeSelector
            ref="timeRef"
            @update="timeRangeUpdateComplete"
          />
        </v-sheet>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { ref } from 'vue'
import { useChartsStore } from '@/stores/charts'
import { useStatsStore } from '../stores/stats'
import { storeToRefs } from 'pinia'
import DataQuality from '@/components/DataQuality.vue'
import StatisticsToggle from './StatisticsToggle.vue'
import TimeRangeSelector from '@/components/TimeRangeSelector.vue'


const chartStore = useChartsStore()
const statsStore = useStatsStore()
const { showLine } = storeToRefs(chartStore)
const { showStatistics } = storeToRefs(chartStore)
const timeRef = ref()

const timeRangeUpdateComplete = async () => {
  // This function is called when the time slider update is complete,
  // and is used to update the chart with series that need to be
  // recomputed.

  console.log('Time range update complete')
  // TODO: re-compute statistics if they have been enabled
  if (showStatistics.value == true) {
    // remove statistics from the chart
    let datasets = chartStore.nodeChartData.datasets.filter(
      (s) => s.seriesType != 'computed_series'
    )

    // recompute statistics
    let statisticSeries = await statsStore.generateStatisticsSeries()

    // push statisticSeries elements into the datasets array
    datasets = datasets.concat(statisticSeries)

    // save these data to the chartStore
    chartStore.updateNodeChartData(datasets)

    // update the chart
    chartStore.updateAllCharts()
  }
}


</script>
