<template>
  <v-card class="pa-2 my-2" color="input">
    <v-card-title>Time Range</v-card-title>
    <v-form>
      <v-text-field
        v-model="dateRange[0]"
        density="compact"
        type="date"
        variant="outlined"
        hide-details
        single-line
        :rules="[rules.min]"
        @update:model-value="updatetimeRange"
      />
      <v-text-field
        v-model="dateRange[1]"
        density="compact"
        type="date"
        variant="outlined"
        hide-details
        single-line
        :rules="[rules.max]"
        @update:model-value="updatetimeRange"
      />
    </v-form>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useFeaturesStore } from '../stores/features'
import { useChartsStore } from '@/stores/charts'
import { useStatsStore } from '../stores/stats'
import { storeToRefs } from 'pinia'
import { convertDateStringToSeconds, convertSecondsToDateString } from '@/_helpers/time'

const featuresStore = useFeaturesStore()
const chartStore = useChartsStore()
const statsStore = useStatsStore()

// There are two inputs. User can select a range of dates (string) using the date picker, or a range of decimal seconds using the slider.
const { timeRange } = storeToRefs(featuresStore)
const dateRange = ref(timeRange.value.map((t) => convertSecondsToDateString(t)))

// When the date range changes, update the slider range.
const updatetimeRange = () => {
  timeRange.value = dateRange.value.map((dateString) => {
    return convertDateStringToSeconds(dateString)
  })
  filterDatasetsToTimeRange()
}

async function filterDatasetsToTimeRange() {
  chartStore.filterDatasetsToTimeRange(dateRange.value[0], dateRange.value[1])
  timeRangeUpdateComplete()
}

const timeRangeUpdateComplete = async () => {
  // This function is called when the time selector update is complete,
  // and is used to update the chart with series that need to be
  // recomputed.

  console.log('Time range update complete')
  // re-compute statistics if they have been enabled
  statsStore.recomputeStatsAndUpdateCharts()
}

const setInitialState = () => {
  // Updates the dateRange object with the range defined
  // by the series visible in the chart.

  // set the initial state for the time ranges based
  // off available data.
  const offset = 2 * 60 * 60 * 24 // 2 days in seconds. This is chosen arbitrarily

  // compute min/max date based on the datasets, omitting computed_series (i.e. derived data)
  const minDateSec =
    Math.min(
      ...chartStore.chartData.datasets
        .filter((series) => series.seriesType != 'computed_series')
        .map((series) => series.minDateTime)
    ) /
      1000 -
    offset
  const maxDateSec =
    Math.max(
      ...chartStore.chartData.datasets
        .filter((series) => series.seriesType != 'computed_series')
        .map((series) => series.maxDateTime)
    ) /
      1000 +
    offset

  featuresStore.minTime = minDateSec
  featuresStore.maxTime = maxDateSec

  dateRange.value = timeRange.value.map((seconds) => {
    return convertSecondsToDateString(seconds)
  })
  filterDatasetsToTimeRange()
}

const rules = {
  min: (v) => {
    if (v === null || v === undefined || v === '') {
      return 'Start date is required'
    }
    if (v > dateRange.value[1]) {
      return 'Start date must be before end date'
    }
    const seconds = convertDateStringToSeconds(v)
    if (seconds < featuresStore.minTime) {
      return 'Start date must be after the first date in the dataset'
    }
    return true
  },
  max: (v) => {
    if (v === null || v === undefined || v === '') {
      return 'End date is required'
    }
    if (v < dateRange.value[0]) {
      return 'End date must be after start date'
    }
    const seconds = convertDateStringToSeconds(v)
    if (seconds > featuresStore.maxTime) {
      return 'End date must be before the last date in the dataset'
    }
    return true
  }
}

defineExpose({
  setInitialState
})
</script>
