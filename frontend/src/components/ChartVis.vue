<template>
  <v-theme-provider theme="light" with-background>
    <Line :data="featureStore.visData" :options="options" />
  </v-theme-provider>
</template>
  
<script setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { useFeaturesStore } from '@/stores/features'

const featureStore = useFeaturesStore()


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

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
  }
}
</script>