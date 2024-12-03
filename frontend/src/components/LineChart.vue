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
        <PlotActions :chosenPlot="lineChart"/>
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
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'
import { onMounted, nextTick } from 'vue'
import PlotActions from './PlotActions.vue'

const { lgAndUp } = useDisplay()
const panel = ref(['plotActions'])
const selectedTimeseriesPoints = ref([])

const chartStore = useChartsStore()
const alertStore = useAlertStore()
const props = defineProps({ data: Object, chosenPlot: Object })
const { chartData } = storeToRefs(chartStore)
const lineChart = ref(null)

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
  chartStore.storeMountedChart(lineChart.value)
  chartStore.updateShowLine()
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
    panel.value = ['plotActions']
  }
}

</script>
