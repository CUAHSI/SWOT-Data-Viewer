<template>
  <v-card class="pa-2 mb-2" color="input">
    <v-form>
      <v-card-title>Time Range</v-card-title>
        <v-text-field
        v-model="dateRange[0]"
        density="compact"
        type="date"
        variant="outlined"
        hide-details
        single-line
        @update:modelValue="updatetimeRange"
        :rules="[rules.min]"
      ></v-text-field>
      <v-text-field
        v-model="dateRange[1]"
        density="compact"
        type="date"
        variant="outlined"
        hide-details
        single-line
        @update:modelValue="updatetimeRange"
        :rules="[rules.max]"
      ></v-text-field>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useFeaturesStore } from '../stores/features'
import { useChartsStore } from '@/stores/charts'
import { storeToRefs } from 'pinia';

// define an update event that emits the new range
const emit = defineEmits(['update'])

const featuresStore = useFeaturesStore()
const chartStore = useChartsStore()

const convertSecondsToDateString = (seconds) => {
  return new Date(seconds * 1000).toISOString().split('T')[0]
}

const convertDateStringToSeconds = (dateString) => {
  return new Date(dateString).getTime() / 1000
}

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
  chartStore.filterDatasetsToTimeRange(
    dateRange.value[0],
    dateRange.value[1]
  )
  emit('update', timeRange.value)
}

const setInitialState = () => {
  // Updates the dateRange object with the range defined
  // by the series visible in the chart.

  // set the initial state for the time ranges based
  // off available data.
  const offset = 2 * 60*60*24 // 2 days in seconds. This is chosen arbitrarily

  // compute min/max date based on the datasets, omitting computed_series (i.e. derived data)
  const minDateSec =
    Math.min(...chartStore.chartData.datasets.filter(series => series.seriesType != 'computed_series').map((series) => series.minDateTime)) / 1000 -
    offset
  const maxDateSec =
    Math.max(...chartStore.chartData.datasets.filter(series => series.seriesType != 'computed_series').map((series) => series.maxDateTime)) / 1000 +
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
