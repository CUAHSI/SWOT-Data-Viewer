<template>
  <v-form>
    <v-container>
      <v-range-slider v-model="sliderRange" :min="featuresStore.minTime" :max="featuresStore.maxTime"
        class="align-center" hide-details @update:modelValue="updateDateRange">
        <template v-slot:prepend>
          <v-text-field v-model="dateRange[0]" density="compact" type="date" variant="outlined" hide-details single-line
            @update:modelValue="updateSliderRange" :rules="[rules.min,]"></v-text-field>
        </template>
        <template v-slot:append>
          <v-text-field v-model="dateRange[1]" density="compact" type="date" variant="outlined" hide-details single-line
            @update:modelValue="updateSliderRange" :rules="[rules.max,]"></v-text-field>
        </template>
      </v-range-slider>
    </v-container>
  </v-form>
</template>

<script setup>
import { ref, defineExpose } from 'vue'
import { useFeaturesStore } from '../stores/features';
import { useChartsStore } from '@/stores/charts'

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

const updateDateRangeFromVisible = () => {
  // Updates the dateRange object with the range defined 
  // by the series visible in the chart.

  let dateSeconds = chartStore.nodeChartData.datasets
                     .filter(series => series.hidden == false)
                     .map(series => series.label)
                     .map(label => convertDateStringToSeconds(label))
  let minDate = convertSecondsToDateString(Math.min(...dateSeconds))
  let maxDate = convertSecondsToDateString(Math.max(...dateSeconds))
  
  // set the new date range values in the dateRange variable
  dateRange.value = [minDate, maxDate];
}

// There are two inputs. User can select a range of dates (string) using the date picker, or a range of decimal seconds using the slider.
const sliderRange = ref(featuresStore.timeRange)
const dateRange = ref(featuresStore.timeRange.map((t) => convertSecondsToDateString(t)))

// update the date range to match the series that
// are visible in the chart
updateDateRangeFromVisible();

// When the date range changes, update the slider range.
const updateSliderRange = () => {
  sliderRange.value = dateRange.value.map((dateString) => {
    return convertDateStringToSeconds(dateString)
  })
  filterDatasetsToTimeRange()
}

// When the slider range changes, update the date range.
const updateDateRange = () => {
  dateRange.value = sliderRange.value.map((seconds) => {
    return convertSecondsToDateString(seconds)
  })
  filterDatasetsToTimeRange()
}

async function filterDatasetsToTimeRange() {
  chartStore.filterDatasetsToTimeRange(chartStore.nodeChartData.datasets, dateRange.value[0], dateRange.value[1])
  emit('update', sliderRange.value)
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
  },
}

defineExpose({
  updateSliderRange,
  updateDateRangeFromVisible,
})

</script>
