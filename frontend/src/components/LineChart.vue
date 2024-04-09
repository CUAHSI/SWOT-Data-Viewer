<template>
  <v-theme-provider theme="light" with-background>
    <!-- <Line :data="chartData" :options="options" ref="line" /> -->
    <Line :data="props.data" :options="options" ref="line" />
  </v-theme-provider>
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
const props = defineProps({ data: Object, selectedVariable: String })
const line = ref(null)

ChartJS.register(LinearScale, TimeScale, PointElement, LineElement, Title, Tooltip, Legend)
// TODO: generate the chart data based on the selected variable
// let chartData = ref(props.data)
// console.log(chartData.value)
// chartData.value.datasets = chartData.value.datasets.map((dataset) => {
//   dataset.parsing.yAxisKey = props.selectedVariable
// })


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
        text: props.selectedVariable
      }
    }
  }
}

onMounted(() => {
  const chartInstance = line.value.chart
  chartStore.setChart(chartInstance)
});

</script>