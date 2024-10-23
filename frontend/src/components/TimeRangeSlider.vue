<template>
  <v-form>
    <v-container>
      <v-range-slider
        v-model="timeRange"
        :min="featuresStore.minTime"
        :max="featuresStore.maxTime"
        class="align-center"
        hide-details
        @update:modelValue="updateDateRange"
        @end="updateDateRangeComplete"
      >
        <template v-slot:prepend>
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
        </template>
        <template v-slot:append>
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
        </template>
      </v-range-slider>
    </v-container>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'
import { useFeaturesStore } from '../stores/features'
import { useChartsStore } from '@/stores/charts'
import { storeToRefs } from 'pinia';

// define an update event that emits the new range
const emit = defineEmits(['update', 'updateComplete'])

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

// When the slider range changes, update the date range.
const updateDateRange = () => {
  dateRange.value = timeRange.value.map((seconds) => {
    return convertSecondsToDateString(seconds)
  })
  filterDatasetsToTimeRange()
}

// When the user is done changing the slider range, emit event.
const updateDateRangeComplete = () => {
  emit('updateComplete', timeRange.value)
}

async function filterDatasetsToTimeRange() {
  chartStore.filterDatasetsToTimeRange(
    chartStore.nodeChartData.datasets,
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
  let offset = 2 * 86400 // 2 days in seconds. This is chosen arbitrarily
  let minDateSec =
    Math.min(...chartStore.nodeChartData.datasets.map((series) => series.minDateTime)) / 1000 -
    offset
  let maxDateSec =
    Math.max(...chartStore.nodeChartData.datasets.map((series) => series.maxDateTime)) / 1000 +
    offset
  timeRange.value = [minDateSec, maxDateSec]
  featuresStore.minTime = minDateSec
  featuresStore.maxTime = maxDateSec

  dateRange.value = timeRange.value.map((seconds) => {
    return convertSecondsToDateString(seconds)
  })
}

// set the min/max time range for the time slider component
setInitialState()

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
