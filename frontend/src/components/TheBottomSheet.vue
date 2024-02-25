<template>
  <v-bottom-sheet v-model="showSheet" inset>
    <v-btn @click="showSheet = false">
      close
    </v-btn>
    <v-card class="text-center" height="100%">
      <v-card-title>
        <h3>SWOT Data</h3>
      </v-card-title>
      <v-card-text>
        <div>
          <ChartVis :data="data" :options="options" />
        </div>
      </v-card-text>
    </v-card>
    <v-card v-for="feature in selectedFeatures" class="text-center" v-bind:key="feature.id" >
      <v-card-text>
        <p>{{ feature }}</p>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>
<script setup>
import ChartVis from "@/components/ChartVis.vue";
import { ref, watch } from 'vue'
import { useFeaturesStore } from '@/stores/features'

const featureStore = useFeaturesStore()

let selectedFeatures = featureStore.selectedFeatures

let showSheet = ref(false)

// if the sheetObject changes, show the sheet
watch(selectedFeatures, async (newFeatures) => {
  // show the sheet if the new features is not empty
  if (newFeatures !== null && newFeatures.length > 0) {
    showSheet.value = true
  }
})

const data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'SWOT DATA',
      data: [40, 39, 10, 40, 39, 80, 40]
    }
  ]
}

const options = {
  responsive: true,
  maintainAspectRatio: false
}
</script>