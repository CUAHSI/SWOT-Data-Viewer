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
        <!-- Add Reset Zoom Icon -->
        <v-btn
          class="zoom-button"
          color="#f4f4f4"
          outlined
          @click="resetZoom()"
          style="position: absolute; top: 80px; right: 520px; z-index: 10;"
          >
          <v-icon :icon="mdiMagnifyMinusOutline" class="me-2"></v-icon>
          RESET ZOOM
        </v-btn> 
        <!-- Chart -->
          <Line :data="nodeChartData" :options="options" ref="activeNodeChart" :plugins="[Filler]" />
        </v-sheet>
        <v-sheet class="pa-2" color="input">
          <TimeRangeSlider
            ref="timeRef"
            @update="timeSliderUpdated"
            @updateComplete="timeRangeUpdateComplete"
          />
        </v-sheet>
      </v-col>
      <v-col>
        <v-sheet>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title> Plot Actions </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-btn :loading="downloading.chart" @click="downloadChart()" class="ma-1" color="input">
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
                  Zoom to Exent
                </v-btn>
                <v-btn @click="resetData()" color="input" class="ma-1">
                  <v-icon :icon="mdiEraser"></v-icon>
                  Reset Data
                </v-btn>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { Filler } from 'chart.js'
import { Line } from 'vue-chartjs'
import 'chartjs-adapter-date-fns'
import { nextTick, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useChartsStore } from '@/stores/charts'
import { storeToRefs } from 'pinia'

const { lgAndUp } = useDisplay()

const chartStore = useChartsStore()

const props = defineProps({ data: Object, chosenPlot: Object })
const { nodeChartData, activeNodeChart } = storeToRefs(chartStore)

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
  chartStore.storeMountedChart(activeNodeChart.value)
  chartStore.updateShowLine()
})

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
          let isHidden = activeNodeChart.value.chart.data.datasets.filter((d) => d.label == 'q0.75')[0].hidden
          activeNodeChart.value.chart.data.datasets.filter((d) => d.label == 'q0.75')[0].hidden = !isHidden
          activeNodeChart.value.chart.update()
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
