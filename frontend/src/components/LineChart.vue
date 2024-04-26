<template>
  <v-container>
    <v-row>
      <v-col cols="10">
        <v-sheet min-height="70vh">
          <Line :data="chartData" :options="options" ref="line" :plugins="[customCanvasBackgroundColor]" />
        </v-sheet>
      </v-col>
      <v-divider class="my-2" vertical></v-divider>
      <v-col>
        <v-btn @click="downloadChart()">
          <v-icon :icon="mdiDownloadBox"></v-icon>Download</v-btn>
        <!-- <v-btn class="ma-2" :icon="mdiPalette" @click="updateChartColor()" size="small">
        </v-btn> -->
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
// import { mdiPalette, mdiDownloadBox } from '@mdi/js'

const chartStore = useChartsStore()
const props = defineProps({ data: Object, chosenVariable: Object })
const line = ref(null)

ChartJS.register(LinearScale, TimeScale, PointElement, LineElement, Title, Tooltip, Legend, customCanvasBackgroundColor)
// TODO: might need a more efficient way of doing this instead of re-mapping the data
// Ideally use the store directly instead of passing it as a prop
let chartData = ref(props.data)

if (props.chosenVariable !== undefined) {
  chartData.value.datasets = chartData.value.datasets.map((dataset) => {
    dataset.parsing.yAxisKey = props.chosenVariable.abbreviation
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

const getChartName = () => {
  let identifier = `${props.data.datasets[0].label}-${props.chosenVariable.abbreviation}`
  identifier = identifier.replace(/[^a-zA-Z0-9]/g, '_')
  return `${identifier}.png`
}

const downloadChart = async () => {
  const filename = getChartName()
  // change the chart background color to white
  line.value.chart.canvas.style.backgroundColor = 'white'

  const image = line.value.chart.toBase64Image('image/png', 1)
  const link = document.createElement('a')
  link.href = image
  link.download = filename
  link.click()
}

const updateChartColor = (color) => {
  if (!color) {
    color = chartStore.dynamicColors()
  }
  line.value.chart.data.datasets.forEach((dataset) => {
    dataset.borderColor = color
    dataset.backgroundColor = color
  })
  // TODO: for some reasone the chart gets clobbered when updating the color
  line.value.chart.update()
}



onMounted(() => {
  const chartInstance = line.value
  chartStore.chart = chartInstance.chart
});

</script>