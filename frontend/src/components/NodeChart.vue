<template>
  <v-container class="overflow-auto">
    <v-row>
      <v-col lg="10">
        <v-sheet :min-height="lgAndUp ? '65vh' : '50vh'" :max-height="lgAndUp ? '100%' : '20vh'" max-width="100%"
          min-width="500px">
          <Line :data="chartData" :options="options" ref="line" :plugins="[customCanvasBackgroundColor, zoomPlugin]" />
        </v-sheet>
      </v-col>
      <v-col lg="2">
        <v-sheet>
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
            Reset Zoom
          </v-btn>
          <v-select label="Timestamp Selector" v-model="timeStamps" :items="timeStamps"  @update:modelValue="filterAllDatasets()" multiple chips></v-select>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js'
import { Line } from 'vue-chartjs'
import 'chartjs-adapter-date-fns';
import { ref } from 'vue'
import { customCanvasBackgroundColor } from '@/_helpers/charts/plugins'
import { mdiDownloadBox, mdiFileDelimited, mdiCodeJson, mdiMagnifyMinusOutline } from '@mdi/js'
import { downloadMultiNodesCsv, downloadMultiNodesJson } from '../_helpers/hydroCron';
import { useDisplay } from 'vuetify'
import zoomPlugin from 'chartjs-plugin-zoom';
import { capitalizeFirstLetter } from '@/_helpers/charts/plugins'
import { useChartsStore } from '../stores/charts';

const { lgAndUp } = useDisplay()

const props = defineProps({ data: Object, chosenVariable: Object })
const line = ref(null)
const downloading = ref({ csv: false, json: false, chart: false })
const chartStore = useChartsStore()

const timeStamps = ref(chartStore.getNodeTimeStamps())

ChartJS.register(LinearScale, TimeScale, PointElement, LineElement, Title, Tooltip, Legend, customCanvasBackgroundColor, zoomPlugin)
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
const title = `${props.data.datasets[0].label}: ${props.chosenVariable?.name} vs Distance`

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      position: 'bottom',
    },
    title: {
      display: true,
      text: title,
      font: {
        size: 16
      },
    },
    customCanvasBackgroundColor: {
      color: 'white',
    },
    zoom: {
      pan: {
        enabled: true,
        mode: 'xy',
      },
      zoom: {
        wheel: {
          enabled: true,
        },
        pinch: {
          enabled: false
        },
        drag: {
          enabled: false
        },
        mode: 'xy',
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
            label += ': ';
          }
          if (context.parsed.y !== null) {
            // label += new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 5 }).format(context.parsed.y);
            label += context.parsed.y
          }
          label += ` ${selectedVariable.unit}`
          return label;
        },
        title: function (context) {
          return `Distance: ${context[0].parsed.x} m`
        },
      },
      displayColors: false,
    },
  },
  scales: {
    x: {
      type: 'linear',
      title: {
        display: true,
        text: 'Distance from outlet (m)'
      }
    },
    y: {
      title: {
        display: true,
        text: yLabel
      }
    }
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
  await downloadMultiNodesCsv()
  downloading.value.csv = false
}

const downJson = async () => {
  downloading.value.json = true
  await downloadMultiNodesJson()
  downloading.value.json = false
}
</script>