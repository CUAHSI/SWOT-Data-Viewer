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
          <v-select label="Data Quality" v-model="dataQuality" :items="dataQualityOptions" item-title="label"
            item-value="value" @update:modelValue="filterAllDatasets()" multiple chips></v-select>
          <v-btn :loading="downloading.chart" @click="downloadChart()" class="mb-2">
            <v-icon :icon="mdiDownloadBox"></v-icon>
            Download Plot
          </v-btn>
          <v-btn :loading="downloading.csv" @click="downCsv()" class="mb-2">
            <v-icon :icon="mdiFileDelimited"></v-icon>
            Download CSV
          </v-btn>
          <v-btn :loading="downloading.json" @click="downJson()" class="mb-2">
            <v-icon :icon="mdiCodeJson"></v-icon>
            Download JSON
          </v-btn>
          <v-btn @click="updateChartColor()">
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
import { enUS } from 'date-fns/locale';
import { useChartsStore } from '@/stores/charts'
import { ref, onMounted } from 'vue'
import { customCanvasBackgroundColor } from '@/_helpers/charts/plugins'
import { mdiPalette, mdiDownloadBox, mdiFileDelimited, mdiCodeJson } from '@mdi/js'
import { downloadCsv, downloadJson } from '../_helpers/hydroCron';

const chartStore = useChartsStore()
const props = defineProps({ data: Object, chosenVariable: Object })
const line = ref(null)
const plotStyle = ref('Scatter')
const dataQuality = ref([0, 1, 2, 3])
const downloading = ref({ csv: false, json: false, chart: false })

ChartJS.register(LinearScale, TimeScale, PointElement, LineElement, Title, Tooltip, Legend, customCanvasBackgroundColor)
// TODO: might need a more efficient way of doing this instead of re-mapping the data
// Ideally use the store directly instead of passing it as a prop
let chartData = ref(props.data)

if (props.chosenVariable !== undefined) {
  chartData.value.datasets = chartData.value.datasets.map((dataset) => {
    dataset.parsing.yAxisKey = props.chosenVariable.abbreviation
    console.log("Dataset", dataset)
    return dataset
  })
}

const yLabel = `${props.chosenVariable?.name} (${props.chosenVariable?.unit})`


const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
    },
    title: {
      display: false,
      text: 'Chart Title'
    },
    customCanvasBackgroundColor: {
      color: 'white',
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
  }
}

const dataQualityOptions = [{ label: 'good', value: 0 }, { label: 'suspect', value: 1 }, { label: 'degraded', value: 2 }, { label: 'bad', value: 3 }]

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
    dataset.backgroundColor = color
  })
  // TODO: for some reasone the chart gets clobbered when updating
  line.value.chart.update()
}

const updateChartLine = () => {
  let showLine = false
  if (plotStyle.value === 'Connected') {
    showLine = true
  }
  line.value.chart.data.datasets.forEach((dataset) => {
    dataset.showLine = showLine
  })
  // TODO: for some reasone the chart gets clobbered when updating
  line.value.chart.update()
}

const filterAllDatasets = () => {
  // TODO: this allows for narrowing the dataset but doesn't allow for expanding it
  let dataQualityValues = dataQuality.value
  chartStore.filterDataQuality(dataQualityValues)
  // TODO: for some reason the chart doesn't get updated even though the data does
  line.value.chart.update()
}


onMounted(() => {
  const chartInstance = line.value
  chartStore.chart = chartInstance.chart
});

</script>