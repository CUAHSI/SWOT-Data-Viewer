<template>
  <v-container class="overflow-auto">
    <v-row>
      <v-col xs="12" lg="9">
        <v-sheet
          :min-height="lgAndUp ? '65vh' : '50vh'"
          :max-height="lgAndUp ? '100%' : '20vh'"
          max-width="100%"
          min-width="500px"
        >
          <Line :data="chartData" :options="options" ref="line" />
        </v-sheet>
      </v-col>
      <v-col xs="12" lg="3">
        <v-expansion-panels with="100%" v-model="panel" multiple>
          <v-expansion-panel value="plotOptions">
            <v-expansion-panel-title>Plot Options</v-expansion-panel-title>
            <v-expansion-panel-text>
              <DataQuality
                v-model="dataQuality"
                id="dataQuality"
                :data="chartStore.chartData"
                @qualityUpdated="filterAllDatasets"
              />

              <v-select
                label="Plot Style"
                v-model="plotStyle"
                :items="['Scatter', 'Connected']"
                @update:modelValue="updateChartLine()"
              ></v-select>
              <v-btn
                :loading="downloading.chart"
                @click="downloadChart()"
                class="ma-1"
                color="input"
              >
                <v-icon :icon="mdiDownloadBox"></v-icon>
                Download Chart
              </v-btn>
              <v-btn :loading="downloading.csv" @click="downCsv()" class="ma-1" color="input">
                <v-icon :icon="mdiFileDelimited"></v-icon>
                Download CSV
              </v-btn>
              <v-btn :loading="downloading.json" @click="downJson()" class="ma-1" color="input">
                <v-icon :icon="mdiCodeJson"></v-icon>
                Download JSON
              </v-btn>
              <v-btn @click="resetZoom()" color="input" class="ma-1">
                <v-icon :icon="mdiMagnifyMinusOutline"></v-icon>
                Reset Zoom
              </v-btn>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel
            :disabled="selectedTimeseriesPoints.length == 0"
            value="selectedTimeseriesPoints"
          >
            <v-expansion-panel-title>Selected Timestamps</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-list>
                <v-list-item
                  v-for="timeSeriesPoint in selectedTimeseriesPoints"
                  :key="timeSeriesPoint.datetime"
                >
                  <template v-slot:append>
                    <v-icon
                      :icon="mdiCloseBox"
                      color="error"
                      @click="removeSelectedTimeseriesPoint(timeSeriesPoint, true)"
                    ></v-icon>
                  </template>
                  <v-list-item-content>
                    <v-list-item-title>{{ timeSeriesPoint.time_str }}</v-list-item-title>
                    <v-list-item-subtitle
                      >Average {{ props.chosenVariable?.abbreviation }}:
                      {{ timeSeriesPoint[props.chosenVariable.abbreviation] }}</v-list-item-subtitle
                    >
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-expansion-panel-text>
            <v-btn
              v-if="selectedTimeseriesPoints.length > 0"
              :loading="!chartStore.hasNodeData"
              :disabled="!chartStore.hasNodeData"
              class="ma-1 float-right"
              color="input"
              @click="viewLongProfileByDates"
            >
              <v-icon :icon="mdiChartBellCurveCumulative"></v-icon>
              View Long Profile
            </v-btn>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { Line } from 'vue-chartjs'
import 'chartjs-adapter-date-fns'
import { enUS } from 'date-fns/locale'
import { useChartsStore } from '@/stores/charts'
import { useAlertStore } from '@/stores/alerts'
import { useFeaturesStore } from '@/stores/features'
import { ref } from 'vue'
import {
  mdiDownloadBox,
  mdiFileDelimited,
  mdiCodeJson,
  mdiMagnifyMinusOutline,
  mdiChartBellCurveCumulative,
  mdiCloseBox
} from '@mdi/js'
import { downloadCsv, downloadFeatureJson } from '../_helpers/hydroCron'
import { useDisplay } from 'vuetify'
import { capitalizeFirstLetter } from '@/_helpers/charts/plugins'
import DataQuality from '@/components/DataQuality.vue'

const { lgAndUp } = useDisplay()
const panel = ref(['plotOptions'])
const selectedTimeseriesPoints = ref([])

const chartStore = useChartsStore()
const alertStore = useAlertStore()
const featuresStore = useFeaturesStore()
const props = defineProps({ data: Object, chosenVariable: Object })
const line = ref(null)
const plotStyle = ref('Scatter')
const dataQuality = ref([0, 1, 2, 3])
const downloading = ref({ csv: false, json: false, chart: false })

// TODO: might need a more efficient way of doing this instead of re-mapping the data
// Ideally use the store directly instead of passing it as a prop
let chartData = ref(props.data)

const setParsing = (datasets) => {
  datasets.forEach((dataset) => {
    dataset.parsing.yAxisKey = props.chosenVariable.abbreviation
  })
}
if (props.chosenVariable !== undefined && chartData.value.datasets !== undefined) {
  setParsing(chartData.value.datasets)
}

const yLabel = `${props.chosenVariable?.name} (${props.chosenVariable?.unit})`
const title = `${props.data.title} - ${props.chosenVariable?.name}`

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      position: 'bottom'
    },
    title: {
      display: true,
      text: title,
      font: {
        size: 16
      }
    },
    customCanvasBackgroundColor: {
      color: 'white'
    },
    zoom: {
      pan: {
        enabled: true,
        mode: 'xy'
      },
      zoom: {
        wheel: {
          enabled: true
        },
        pinch: {
          enabled: false
        },
        drag: {
          enabled: false
        },
        mode: 'xy'
      }
    },
    tooltip: {
      // https://www.chartjs.org/docs/latest/configuration/tooltip.html
      callbacks: {
        label: function (context) {
          // var label = context.dataset.label || '';
          let selectedVariable = props.chosenVariable
          let label = `${capitalizeFirstLetter(selectedVariable.abbreviation)}`
          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            // label += new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 5 }).format(context.parsed.y);
            label += context.parsed.y
          }
          label += ` ${selectedVariable.unit}`
          return label
        },
        footer: function (context) {
          const dataQualityOption = chartStore.dataQualityOptions.find(
            (option) => option.value == context[0]?.raw?.reach_q
          )
          if (dataQualityOption) {
            return `\n Data Quality: ${dataQualityOption.label}`
          }
          return ''
        }
      },
      displayColors: false
    }
  },
  scales: {
    x: {
      type: 'time',
      time: {
        // unit: 'day',
        // displayFormats: {
        //   day: 'MM.dd'
        // },
        locale: enUS
      },
      title: {
        display: true,
        text: 'Date'
      }
    },
    y: {
      title: {
        display: true,
        text: yLabel
      }
    }
  },
  onClick: (e) => handleTimeseriesPointClick(e)
  // events: ["click", "contextmenu"],
}

const handleTimeseriesPointClick = (e) => {
  const elems = line.value.chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false)
  if (elems.length <= 0) {
    return
  }
  const datasetIndex = elems[0].datasetIndex
  const index = elems[0].index
  const dataset = line.value.chart.data.datasets[datasetIndex]
  const timeSeriesPoint = dataset.data[index]

  addSelectedTimeseriesPoint(timeSeriesPoint)
}

const viewLongProfileByDates = () => {
  chartStore.setDatasetVisibility(chartStore.nodeChartData.datasets, true)
  chartStore.filterDatasetsBySetOfDates(null, selectedTimeseriesPoints.value)
  chartStore.chartTab = 'distance'
  // TODO: update the date range slider based on the selections
  featuresStore.timeRange.value = [
    selectedTimeseriesPoints.value[0].datetime,
    selectedTimeseriesPoints.value[selectedTimeseriesPoints.value.length - 1].datetime
  ]
}

const addSelectedTimeseriesPoint = (timeSeriesPoint) => {
  // first make sure the node is not already selected
  if (selectedTimeseriesPoints.value.includes(timeSeriesPoint)) {
    alertStore.displayAlert({
      title: 'Timstamp deselected',
      text: `The point at ${timeSeriesPoint.datetime} deselected.`,
      type: 'success',
      closable: true,
      duration: 3
    })
    removeSelectedTimeseriesPoint(timeSeriesPoint)
    return
  }

  // set the point as selected
  timeSeriesPoint.selected = true

  // instead of push, make sure the points are in order by datetime
  const newPoints = [...selectedTimeseriesPoints.value, timeSeriesPoint]
  newPoints.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
  selectedTimeseriesPoints.value = newPoints

  panel.value = ['selectedTimeseriesPoints']
}

const removeSelectedTimeseriesPoint = (timeSeriesPoint, ref = false) => {
  if (timeSeriesPoint.selected) {
    timeSeriesPoint.selected = false
    const index = selectedTimeseriesPoints.value.indexOf(timeSeriesPoint)
    selectedTimeseriesPoints.value.splice(index, 1)

    // in the case that the point was removed from the selected list, make sure to remove the selected state
    if (ref) {
      line.value.chart.update()
    }
  }

  if (selectedTimeseriesPoints.value.length === 0) {
    panel.value = ['plotOptions']
  }
}

const resetZoom = () => {
  line.value.chart.resetZoom()
}

const getChartName = () => {
  let identifier = `${props.data.datasets[0].label}-${props.chosenVariable.abbreviation}`
  identifier = identifier.replace(/[^a-zA-Z0-9]/g, '_')
  return `${identifier}.png`
}

const downloadChart = async () => {
  downloading.value.chart = true
  const filename = getChartName()
  // change the chart background color to white
  line.value.chart.canvas.style.backgroundColor = 'white'

  const image = line.value.chart.toBase64Image('image/png', 1)
  const link = document.createElement('a')
  link.href = image
  link.download = filename
  link.click()
  downloading.value.chart = false
}

const downCsv = async () => {
  downloading.value.csv = true
  await downloadCsv()
  downloading.value.csv = false
}

const downJson = async () => {
  downloading.value.json = true
  await downloadFeatureJson()
  downloading.value.json = false
}

const updateChartLine = () => {
  let showLine = false
  if (plotStyle.value === 'Connected') {
    showLine = true
  }
  line.value.chart.data.datasets.forEach((dataset) => {
    dataset.showLine = showLine
    setParsing(line.value.chart.data.datasets)
  })
  line.value.chart.update()
}

const filterAllDatasets = (dataQualityValues) => {
  chartStore.filterDataQuality(dataQualityValues, line.value.chart.data.datasets, 'reach_q')
  setParsing(line.value.chart.data.datasets)
  line.value.chart.update()
}
</script>
