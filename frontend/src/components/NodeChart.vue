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
            style="position: absolute; top: 80px; right: 45px; z-index: 10"
            :icon="mdiMagnifyMinusOutline"
            @click="resetZoom()"
          />
        </template>
        RESET ZOOM
      </v-tooltip>
      <!-- Chart -->
      <Line ref="activeNodeChart" :data="nodeChartData" :options="options" :plugins="[Filler]" />
    </v-sheet>
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
import { mdiMagnifyMinusOutline } from '@mdi/js'

const { lgAndUp } = useDisplay()

const chartStore = useChartsStore()

const props = defineProps({ data: Object, chosenPlot: Object })
const { nodeChartData, activeNodeChart } = storeToRefs(chartStore)

let xLabel = 'Distance from outlet (m)'
let yLabel = `${props.chosenPlot?.name} (${props.chosenPlot?.unit})`

let plt = props.chosenPlot
xLabel = `${plt.xvar.name} (${plt.xvar.unit})`
yLabel = `${plt.yvar.name} (${plt.yvar.unit})`

onMounted(async () => {
  // wait for chart to be available
  await nextTick()

  // push the chart to the store
  chartStore.storeMountedChart(activeNodeChart.value)
  chartStore.updateSymbology()
})

const resetZoom = () => {
  if (activeNodeChart.value?.chart?.resetZoom) {
    activeNodeChart.value.chart.resetZoom()
  } else {
    console.error('Chart instance not found or resetZoom method is unavailable.')
  }
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
      display: true,
      position: 'top',
      align: 'end',
      labels: {
        usePointStyle: true,
        generateLabels: () => chartStore.generateDataQualityLegend('node'),
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
