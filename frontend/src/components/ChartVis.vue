<template>
  <v-theme-provider theme="light" with-background>
    <Line :data="data" :options="options" />
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
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { buildFakeData } from '@/_helpers/fakeData'

const featureStore = useFeaturesStore()
let shouldFakeData = featureStore.shouldFakeData

let data = ref({})

if (shouldFakeData) {
  data.value = buildFakeData(featureStore.selectedFeatures)
}else{
  // TODO what if not faking data?
  data.value = {}
}


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