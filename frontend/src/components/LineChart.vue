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
          <Line :data="chartData" :options="options" ref="lineChart" />
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
                v-model="showLine"
                :items="[{title: 'Scatter', value: false}, {title: 'Connected', value: true}]"
                @update:modelValue="chartStore.updateShowLine"
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
                    <v-list-item-title>{{ timeSeriesPoint.time_str }}</v-list-item-title>
                    <v-list-item-subtitle
                      >Average {{ props.chosenPlot?.abbreviation }}:
                      {{ timeSeriesPoint[props.chosenPlot.abbreviation] }}</v-list-item-subtitle
                    >
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
import { storeToRefs } from 'pinia'
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
import DataQuality from '@/components/DataQuality.vue'
import { onMounted, nextTick } from 'vue'

const { lgAndUp } = useDisplay()
const panel = ref(['plotOptions'])
const selectedTimeseriesPoints = ref([])

const chartStore = useChartsStore()
const alertStore = useAlertStore()
const featuresStore = useFeaturesStore()
const props = defineProps({ data: Object, chosenPlot: Object })
const { showLine, chartData } = storeToRefs(chartStore)
const lineChart = ref(null)
const dataQuality = ref([0, 1, 2, 3])
const downloading = ref({ csv: false, json: false, chart: false })

// set the initial plot labels. This is overridden in the setParting function
let xLabel = 'Date'
let yLabel = `${props.chosenPlot?.name} (${props.chosenPlot?.unit})`
let title = `${props.data.title}: ${props.chosenPlot?.name} vs Time`

onMounted(async () => {
  // wait for chart to be available
  await nextTick()

  // push the chart to the store
  chartStore.storeMountedChart(lineChart.value)
  chartStore.updateShowLine()
})

const setParsing = (datasets) => {
  // TODO: instead of parsing on dataset, set parsing at the chart level
  // https://www.chartjs.org/docs/latest/api/interfaces/CoreChartOptions.html#parsing
  
  datasets.forEach((dataset) => {

    // update the chart based on the selected plot 
    var plt = props.chosenPlot
    dataset.parsing.xAxisKey = plt.xvar.abbreviation
    dataset.parsing.yAxisKey = plt.yvar.abbreviation

    // check that the variable has a unit, if it does, add it to the label
    // if it doesn't, just use the name. This will be the case when the
    // x-variable is "time"
    if (plt.xvar.unit != undefined) {
      xLabel = `${plt.xvar.name} (${plt.xvar.unit})`
    } else {
      xLabel = `${plt.xvar.name}`
    }

    yLabel = `${plt.yvar.name} (${plt.yvar.unit})`
    title = `${props.data.title}\n${plt.title}`
  })
}
if (props.chosenPlot !== undefined && chartData.value.datasets !== undefined) {
  setParsing(chartData.value.datasets)
}

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
          let plt = props.chosenPlot
          let label = `${plt.yvar.name}`
          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y
          }
          label += ` ${plt.yvar.unit}`
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
        text: xLabel
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
}

const handleTimeseriesPointClick = (e) => {
  const elems = lineChart.value.chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false)
  if (elems.length <= 0) {
    return
  }
  const datasetIndex = elems[0].datasetIndex
  const index = elems[0].index
  const dataset = lineChart.value.chart.data.datasets[datasetIndex]
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
      lineChart.value.chart.update()
    }
  }

  if (selectedTimeseriesPoints.value.length === 0) {
    panel.value = ['plotOptions']
  }
}

const resetZoom = () => {
  lineChart.value.chart.resetZoom()
}

const getChartName = () => {
  let identifier = `${chartData.value.datasets[0].label}-${props.chosenPlot.abbreviation}`
  identifier = identifier.replace(/[^a-zA-Z0-9]/g, '_')
  return `${identifier}.png`
}

const downloadChart = async () => {
  downloading.value.chart = true
  const filename = getChartName()
  // change the chart background color to white
  lineChart.value.chart.canvas.style.backgroundColor = 'white'

  const image = lineChart.value.chart.toBase64Image('image/png', 1)
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

const filterAllDatasets = (dataQualityValues) => {
  chartStore.filterDataQuality(dataQualityValues, lineChart.value.chart.data.datasets, 'reach_q')
  setParsing(lineChart.value.chart.data.datasets)
  lineChart.value.chart.update()
}
</script>
