<template>
  <v-container>
    <v-row>
      <v-col cols="10">
        <v-sheet min-height="65vh" max-height="100%">
          <Line :data="chartData" :options="options" ref="line" :plugins="[customCanvasBackgroundColor]" />
        </v-sheet>
      </v-col>
      <v-divider class="my-2" vertical></v-divider>
      <v-col>
        <v-sheet>
          <v-select label="Plot Style" v-model="plotStyle" :items="['Scatter', 'Connected',]"
            @update:modelValue="updateChartLine()"></v-select>
          <v-btn :loading="downloading.chart" @click="downloadChart()" class="mb-2" color="input">
            <v-icon :icon="mdiDownloadBox"></v-icon>
            Download Plot
          </v-btn>
          <v-btn :loading="downloading.csv" @click="downCsv()" class="mb-2" color="input">
            <v-icon :icon="mdiFileDelimited"></v-icon>
            Download CSV
          </v-btn>
          <v-btn :loading="downloading.json" @click="downJson()" class="mb-2" color="input">
            <v-icon :icon="mdiCodeJson"></v-icon>
            Download JSON
          </v-btn>
          <v-btn @click="updateChartColor()" color="input">
            <v-icon :icon="mdiPalette"></v-icon>
            Randomize Color
          </v-btn>
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
import { useChartsStore } from '@/stores/charts'
import { ref } from 'vue'
import { customCanvasBackgroundColor } from '@/_helpers/charts/plugins'
import { mdiPalette, mdiDownloadBox, mdiFileDelimited, mdiCodeJson } from '@mdi/js'
import { downloadCsv, downloadJson } from '../_helpers/hydroCron';

const chartStore = useChartsStore()
const props = defineProps({ data: Object, chosenVariable: Object })
const line = ref(null)
const plotStyle = ref('Scatter')
const downloading = ref({ csv: false, json: false, chart: false })

ChartJS.register(LinearScale, TimeScale, PointElement, LineElement, Title, Tooltip, Legend, customCanvasBackgroundColor)
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

const yLabel = `${props.chosenVariable?.plot_definition} (${props.chosenVariable?.units})`
const title = `${props.data.datasets[0].label}: ${props.chosenVariable?.plot_definition} vs Distance`

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
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
    }
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
  await downloadJson()
  downloading.value.json = false
}

const updateChartColor = (color) => {
  if (!color) {
    color = chartStore.dynamicColors()
  }
  line.value.chart.data.datasets.forEach((dataset) => {
    dataset.borderColor = color
    setParsing(line.value.chart.data.datasets)
  })
  line.value.chart.update()
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
</script>