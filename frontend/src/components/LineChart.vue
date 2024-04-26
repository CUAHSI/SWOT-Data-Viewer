<template>
  <v-sheet>
    <v-theme-provider theme="light" with-background>
      <Line :data="chartData" :options="options" ref="line" />
      <!-- <Line :data="props.data" :options="options" ref="line" /> -->
    </v-theme-provider>
    <v-btn @click="downloadChart()">Download Chart</v-btn>
  </v-sheet>
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

const chartStore = useChartsStore()
const props = defineProps({ data: Object, chosenVariable: Object })
const line = ref(null)

ChartJS.register(LinearScale, TimeScale, PointElement, LineElement, Title, Tooltip, Legend)
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

onMounted(() => {
  const chartInstance = line.value
  chartStore.chart = chartInstance.chart
});

</script>