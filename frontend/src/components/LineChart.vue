<template>
  <v-container class="overflow-auto">
    <v-sheet
      :min-height="lgAndUp ? '65vh' : '50vh'"
      :max-height="lgAndUp ? '100%' : '20vh'"
      max-width="100%"
      min-width="500px"
    >
      <!-- Add Reset Zoom Icon -->
      <v-tooltip>
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            color="input"
            size="small"
            style="position: absolute; top: 120px; right: 45px; z-index: 10"
            :icon="mdiMagnifyMinusOutline"
            @click="resetZoom()"
          />
        </template>
        RESET ZOOM
      </v-tooltip>
      <!-- Chart -->
      <Line ref="activeReachChart" :data="chartData" :options="options" />
    </v-sheet>
    <v-card v-if="hasSelectedTimeseriesPoints">
      <v-card-title>Selected Timestamps</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="timeSeriesPoint in selectedTimeseriesPoints"
            :key="timeSeriesPoint.datetime"
          >
            <template #append>
              <v-icon
                :icon="mdiCloseBox"
                color="error"
                @click="removeSelectedTimeseriesPoint(timeSeriesPoint, true)"
              />
            </template>
            <v-list-item-title>{{ timeSeriesPoint.time_str }}</v-list-item-title>
            <v-list-item-subtitle>
              Average {{ props.chosenPlot?.abbreviation }}:
              {{ timeSeriesPoint[props.chosenPlot.abbreviation] }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-btn
        v-if="hasSelectedTimeseriesPoints"
        :loading="!chartStore.hasNodeData"
        :disabled="!chartStore.hasNodeData"
        class="ma-1 float-right"
        color="input"
        @click="viewLongProfileByDates"
      >
        <v-icon :icon="mdiChartBellCurveCumulative" />
        View Long Profile
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
import { Line } from 'vue-chartjs'
import 'chartjs-adapter-date-fns'
import { enUS } from 'date-fns/locale'
import { useChartsStore } from '@/stores/charts'
import { useAlertStore } from '@/stores/alerts'
import { useFeaturesStore } from '@/stores/features'
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'
import { onMounted, nextTick } from 'vue'
import { mdiChartBellCurveCumulative, mdiCloseBox, mdiMagnifyMinusOutline } from '@mdi/js'
import { convertDateStringToSeconds } from '@/_helpers/time'
import { useStatsStore } from '../stores/stats'

const { lgAndUp } = useDisplay()
const panel = ref(['plotActions'])

const hasSelectedTimeseriesPoints = computed(() => selectedTimeseriesPoints.value.length > 0)

const chartStore = useChartsStore()
const statsStore = useStatsStore()
const alertStore = useAlertStore()
const featuresStore = useFeaturesStore()
const props = defineProps({ data: Object, chosenPlot: Object })
const { chartData, activeReachChart, selectedTimeseriesPoints } = storeToRefs(chartStore)
const { timeRange } = storeToRefs(featuresStore)

let xLabel = 'Date'
let yLabel = `${props.chosenPlot?.name} (${props.chosenPlot?.unit})`
let title = `${props.data.title}: ${props.chosenPlot?.name} vs Time`

let plt = props.chosenPlot
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

onMounted(async () => {
  // wait for chart to be available
  await nextTick()

  // push the chart to the store
  chartStore.storeMountedChart(activeReachChart.value)
  chartStore.updateSymbology()
})

const getParsing = () => {
  let plt = props.chosenPlot
  let parsing = {}

  parsing.xAxisKey = plt.xvar.abbreviation
  parsing.yAxisKey = plt.yvar.abbreviation
  return parsing
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  parsing: getParsing,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      align: 'end',
      labels: {
        usePointStyle: true,
        generateLabels: () => chartStore.generateDataQualityLegend('line'),
        font: {
          size: 12
        },
        boxWidth: 20,
        padding: 10
      },
      title: {
        display: true,
        text: 'Data Quality',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10
        }
      }
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

const resetZoom = () => {
  if (activeReachChart.value?.chart?.resetZoom) {
    activeReachChart.value.chart.resetZoom()
  } else {
    console.error('Chart instance not found or resetZoom method is unavailable.')
  }
}

const handleTimeseriesPointClick = (e) => {
  const elems = activeReachChart.value.chart.getElementsAtEventForMode(
    e,
    'nearest',
    { intersect: true },
    false
  )
  if (elems.length <= 0) {
    return
  }
  const datasetIndex = elems[0].datasetIndex
  const index = elems[0].index
  const dataset = activeReachChart.value.chart.data.datasets[datasetIndex]
  const timeSeriesPoint = dataset.data[index]

  addSelectedTimeseriesPoint(timeSeriesPoint)
}

const viewLongProfileByDates = () => {
  chartStore.setDatasetVisibility(chartStore.nodeChartData.datasets, true)
  chartStore.filterDatasetsBySetOfDates(null)
  let start = selectedTimeseriesPoints.value[0].datetime
  let end = selectedTimeseriesPoints.value[selectedTimeseriesPoints.value.length - 1].datetime
  start = convertDateStringToSeconds(start)
  end = convertDateStringToSeconds(end)
  timeRange.value = [start, end]
  // chartStore.filterDatasetsToTimeRange()
  chartStore.chartTab = 'distance'
  chartStore.updateNodeDataSetStyles()
  chartStore.refreshAllCharts()
  // if stats are turned on, the stats will be stale
  statsStore.toggleSeriesStatistics(chartStore.showStatistics.value)
  statsStore.recomputeStatsAndUpdateCharts()
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
      activeReachChart.value.chart.update()
    }
  }

  if (selectedTimeseriesPoints.value.length === 0) {
    panel.value = ['plotActions']
  }
}
</script>
