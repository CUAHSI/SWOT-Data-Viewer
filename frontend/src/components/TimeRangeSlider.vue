<template>
  <v-form>
    <v-container>
      <v-range-slider
        v-model="timeRange"
        :min="featuresStore.minTime"
        :max="featuresStore.maxTime"
        class="align-center"
        hide-details
        @update:model-value="updateDateRange"
        @end="updateDateRangeComplete"
      >
        <template #prepend>
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
        </template>
        <template #append>
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
        </template>
      </v-range-slider>
    </v-container>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'
import { useFeaturesStore } from '../stores/features'
import { useChartsStore } from '@/stores/charts'
import { storeToRefs } from 'pinia'
import { convertDateStringToSeconds, convertSecondsToDateString } from '@/_helpers/time'

// define an update event that emits the new range
const emit = defineEmits(['update', 'updateComplete'])

const featuresStore = useFeaturesStore()
const chartStore = useChartsStore()

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
}

// When the user is done changing the slider range, emit event.
const updateDateRangeComplete = () => {
  filterDatasetsToTimeRange()
  emit('updateComplete', timeRange.value)
}

async function filterDatasetsToTimeRange() {
  chartStore.filterDatasetsToTimeRange(dateRange.value[0], dateRange.value[1])
  emit('update', timeRange.value)
}

const setInitialState = () => {
  // Updates the dateRange object with the range defined
  // by the series visible in the chart.

  // set the initial state for the time ranges based
  // off available data.
  const offset = 2 * 86400 // 2 days in seconds. This is chosen arbitrarily

  // compute min/max date based on the datasets, omitting computed_series (i.e. derived data)
  const minDateSec =
    Math.min(
      ...chartStore.nodeChartData.datasets
        .filter((series) => series.seriesType != 'computed_series')
        .map((series) => series.minDateTime)
    ) /
      1000 -
    offset
  const maxDateSec =
    Math.max(
      ...chartStore.nodeChartData.datasets
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
