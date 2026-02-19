<template>
  <v-expansion-panels v-model="panel" with="100%" multiple>
    <v-expansion-panel value="plotActions">
      <v-expansion-panel-title>Actions</v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-btn :loading="downloading.chart" class="ma-1" color="input" @click="downloadChart()">
          <v-icon :icon="mdiDownloadBox" />
          Download Chart
        </v-btn>
        <v-btn :loading="downloading.csv" class="ma-1" color="input" @click="downCsv()">
          <v-icon :icon="mdiFileDelimited" />
          Download CSV
        </v-btn>
        <v-btn :loading="downloading.json" class="ma-1" color="input" @click="downJson()">
          <v-icon :icon="mdiCodeJson" />
          Download JSON
        </v-btn>
        <v-btn color="input" class="ma-1" @click="resetZoom()">
          <v-icon :icon="mdiMagnifyMinusOutline" />
          Reset Zoom
        </v-btn>
        <v-btn v-if="isNodeChart" color="input" class="ma-1" @click="resetData()">
          <v-icon :icon="mdiEraser" />
          Reset Data
        </v-btn>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import 'chartjs-adapter-date-fns'
import { useChartsStore } from '@/stores/charts'
import { useFeaturesStore } from '@/stores/features'
import { ref, computed, defineEmits, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  mdiDownloadBox,
  mdiFileDelimited,
  mdiCodeJson,
  mdiMagnifyMinusOutline,
  mdiEraser
} from '@mdi/js'
import {
  downloadCsv,
  downloadMultiNodesCsv,
  downloadFeatureJson,
  downloadMultiNodesJson
} from '../_helpers/hydroCron'
import { useRoute } from 'vue-router'

const route = useRoute()
const panel = ref([])

const pageUrl = ref(window.location.href)

watch(route, () => {
  pageUrl.value = window.location.href
})

const chartStore = useChartsStore()
const featureStore = useFeaturesStore()
const props = defineProps({ chosenPlot: Object })
const emit = defineEmits(['resetData'])
const { chartData, nodeChartData, showStatistics } = storeToRefs(chartStore)
const downloading = ref({ csv: false, json: false, chart: false })

const isNodeChart = computed(() => {
  return props?.chosenPlot?.chart?.data?.datasets[0]?.seriesType === 'swot_node_series'
})

const resetZoom = () => {
  props.chosenPlot.chart.resetZoom()
}

const setDefaults = () => {
  // sets page elements back to their default values.

  // set statistics switch to off in the charts store
  showStatistics.value = false
}

const getChartName = () => {
  let identifier = ''
  if (isNodeChart.value) {
    identifier = `${nodeChartData.value.title}`
  } else {
    identifier = `${chartData.value.title}`
  }

  const paramsString = pageUrl.value.split('?')[1]
  const params = new URLSearchParams(paramsString)
  if (params) {
    // remove any parameters that should not be included in the filename
    const params_to_include = ['variables', 'plot']
    for (const [key] of params.entries()) {
      if (!params_to_include.includes(key)) {
        params.delete(key)
      }
    }
    identifier += `_${params.toString()}`
  }

  identifier = identifier.replace(/%2F/g, ',').replace(/%/g, ',')
  identifier = identifier.replace(/ /g, '')
  return `${identifier}.png`
}

const downloadChart = async () => {
  downloading.value.chart = true
  const filename = getChartName()
  // change the chart background color to white
  // props.chosenPlot.chart.canvas.style.backgroundColor = 'white'

  const image = props.chosenPlot.chart.toBase64Image('image/png', 1)
  const link = document.createElement('a')
  link.href = image
  link.download = filename
  link.click()
  downloading.value.chart = false
}

const downCsv = async () => {
  downloading.value.csv = true
  // determine whether to download the node or feature csv
  if (isNodeChart.value) {
    await downloadMultiNodesCsv()
  } else {
    await downloadCsv()
  }
  downloading.value.csv = false
}

const downJson = async () => {
  downloading.value.json = true
  // determine whether to download the node or feature
  if (isNodeChart.value) {
    await downloadMultiNodesJson()
  } else {
    await downloadFeatureJson()
  }
  downloading.value.json = false
}

const resetData = () => {
  // Resets the node chart to its initial state. This requires
  // making all swot_node_series visible, removing any additional
  // series that have been added to the chart (e.g. statistics),
  // and setting page components to their initial state.

  // remove all non-swot series from the chart. This is necessary
  // to reset the chart to its initial state.
  let datasets = nodeChartData.value.datasets.filter((s) => s.seriesType == 'swot_node_series')

  // turn on all hidden swot node series datasets
  datasets
    .filter((s) => s.seriesType == 'swot_node_series')
    .forEach(function (s) {
      s.hidden = false
    })

  // set these datasets in the chart store
  chartStore.updateNodeChartData(datasets)

  // Reset timeslider extents to the full range of the data
  // timeRef.value.setInitialState()
  featureStore.resetTimeRange()

  // reset page components to their default state, e.g. statistics switch
  setDefaults()

  // to update the chart
  emit('resetData')
  // props.chosenPlot.chart.data.datasets = nodeChartData.value.datasets
  // props.chosenPlot.chart.update()
}
</script>
