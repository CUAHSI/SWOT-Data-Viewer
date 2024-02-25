<template>
  <v-theme-provider theme="light" with-background>
    <Line :data="props.data" :options="options" />
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)
const props = defineProps(['data'])

const options = {
  responsive: true,
  maintainAspectRatio: false
}
</script>