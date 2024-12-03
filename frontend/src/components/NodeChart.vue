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
          <Line :data="nodeChartData" :options="options" ref="nodeChart" :plugins="[Filler]" />
        </v-sheet>
      </v-col>
      <v-col>
        <PlotActions :chosenPlot="nodeChart" @reset-data="resetData"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { Filler } from 'chart.js'
import { Line } from 'vue-chartjs'
import 'chartjs-adapter-date-fns'
import { ref, nextTick, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useChartsStore } from '@/stores/charts'
import { storeToRefs } from 'pinia'
import PlotActions from './PlotActions.vue'


const { lgAndUp } = useDisplay()

const chartStore = useChartsStore()

const props = defineProps({ data: Object, chosenPlot: Object })
const { nodeChartData } = storeToRefs(chartStore)
const nodeChart = ref(null)

let xLabel = 'Distance from outlet (m)'
let yLabel = `${props.chosenPlot?.name} (${props.chosenPlot?.unit})`
let title = `${props.data.title}: ${props.chosenPlot?.name} vs Distance`

let plt = props.chosenPlot
xLabel = `${plt.xvar.name} (${plt.xvar.unit})`
yLabel = `${plt.yvar.name} (${plt.yvar.unit})`
title = `${props.data.title}\n${plt.title}`

onMounted(async () => {
  // wait for chart to be available
  await nextTick()

  // push the chart to the store
  chartStore.storeMountedChart(nodeChart.value)
  chartStore.updateShowLine()
})

const resetData = () => {
  nodeChart.value.chart.data.datasets = nodeChartData.value.datasets
  nodeChart.value.chart.update()
}

const getParsing = () => {
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
      position: 'bottom',
      labels: {
        // hide the q0.75 series from the legend. This is because the interquartile range
        // will be toggled by a single series. We'll use q0.25 for this.
        filter: (item) => item.text !== 'q0.75'
      },
      onClick: function (e, legendItem, legend) {
        const index = legendItem.datasetIndex
        const ci = legend.chart

        if (legendItem.text == 'IQR') {
          // toggle the IQR data series
          toggleByIndex(index)

          // toggle the q0.75 data series that is not displayed in the legend. This will make
          // IQR appear as a patch instead of a line.
          let isHidden = nodeChart.value.chart.data.datasets.filter((d) => d.label == 'q0.75')[0].hidden
          nodeChart.value.chart.data.datasets.filter((d) => d.label == 'q0.75')[0].hidden = !isHidden
          nodeChart.value.chart.update()
        } else {
          toggleByIndex(index)
        }

        function toggleByIndex(index) {
          if (ci.isDatasetVisible(index)) {
            ci.hide(index)
            legendItem.hidden = true
          } else {
            ci.show(index)
            legendItem.hidden = false
          }
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
        title: function (context) {
          let plt = props.chosenPlot
          return `${plt.xvar.name}: ${context[0].parsed.x} (${plt.xvar.unit})`
        },
        label: function (context) {
          let plt = props.chosenPlot
          let label = `${plt.yvar.name}`
          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            // label += new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 5 }).format(context.parsed.y);
            label += context.parsed.y
          }
          label += ` ${plt.yvar.unit}`
          // add the timestamp as well
          return label
        },
        footer: function (context) {
          let footer = `\nDate: ${context[0].dataset.label}`
          const dataQualityOption = chartStore.dataQualityOptions.find(
            (option) => option.value == context[0]?.raw?.node_q
          )
          if (dataQualityOption) {
            footer += `\nData Quality: ${dataQualityOption.label}`
          }
          return footer
        }
      },
      displayColors: false
    }
  },
  scales: {
    x: {
      type: 'linear',
      title: {
        display: true,
        text: xLabel
      },
      reverse: true
    },
    y: {
      title: {
        display: true,
        text: yLabel
      }
    }
  }
}
</script>
