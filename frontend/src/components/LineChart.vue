<template>
  <v-container class="overflow-auto">
    <v-row>
      <v-col xs="12" lg="10">
        <v-sheet :min-height="lgAndUp ? '65vh' : '50vh'" :max-height="lgAndUp ? '100%' : '20vh'" max-width="100%"
          min-width="500px">
          <Line :data="chartData" :options="options" ref="line" :plugins="[zoomPlugin]" />
        </v-sheet>
      </v-col>
      <v-col xs="12" lg="2">
        <v-sheet>
          <v-select label="Data Quality" v-model="dataQuality" :items="dataQualityOptions" item-title="label"
            item-value="value" @update:modelValue="filterAllDatasets()" multiple chips></v-select>
          <v-select label="Plot Style" v-model="plotStyle" :items="['Scatter', 'Connected',]"
            @update:modelValue="updateChartLine()"></v-select>
          <v-btn :loading="downloading.chart" @click="downloadChart()" class="ma-1" color="input">
            <v-icon :icon="mdiDownloadBox"></v-icon>
            Download
          </v-btn>
          <v-btn :loading="downloading.csv" @click="downCsv()" class="ma-1" color="input">
            <v-icon :icon="mdiFileDelimited"></v-icon>
            CSV
          </v-btn>
          <v-btn :loading="downloading.json" @click="downJson()" class="ma-1" color="input">
            <v-icon :icon="mdiCodeJson"></v-icon>
            JSON
          </v-btn>
          <v-btn @click="resetZoom()" color="input" class="ma-1">
            <v-icon :icon="mdiLoupe"></v-icon>
            Reset Zoom
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
import { enUS } from 'date-fns/locale';
import { useChartsStore } from '@/stores/charts'
import { ref } from 'vue'
import { customCanvasBackgroundColor } from '@/_helpers/charts/plugins'
import { mdiPalette, mdiDownloadBox, mdiFileDelimited, mdiCodeJson, mdiLoupe } from '@mdi/js'
import { downloadCsv, downloadJson } from '../_helpers/hydroCron';
import { useDisplay } from 'vuetify'
import zoomPlugin from 'chartjs-plugin-zoom';

const { lgAndUp } = useDisplay()

const chartStore = useChartsStore()
const props = defineProps({ data: Object, chosenVariable: Object })
const line = ref(null)
const plotStyle = ref('Scatter')
const dataQuality = ref([0, 1, 2, 3])
const downloading = ref({ csv: false, json: false, chart: false })

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
const title = `${props.data.datasets[0].label}: ${props.chosenVariable?.name} vs Time`


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
      zoom: {
        wheel: {
          enabled: false,
        },
        pinch: {
          enabled: false
        },
        drag: {
          enabled: true
        },
        mode: 'xy',
      }
    },
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
  }
}

const dataQualityOptions = [{ label: 'good', value: 0 }, { label: 'suspect', value: 1 }, { label: 'degraded', value: 2 }, { label: 'bad', value: 3 }]

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
  await downloadJson()
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

const filterAllDatasets = () => {
  let dataQualityValues = dataQuality.value
  chartStore.filterDataQuality(dataQualityValues, line.value.chart.data.datasets)
  setParsing(line.value.chart.data.datasets)
  line.value.chart.update()
}
</script>