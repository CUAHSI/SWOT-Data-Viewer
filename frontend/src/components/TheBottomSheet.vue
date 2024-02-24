<template>
  <v-bottom-sheet v-model="props.show" inset>
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
    <v-card class="text-center">
      <v-card-text>
        <p>{{ sheetObject }}</p>
        <v-btn @click="props.show = null">
          close
        </v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>
<script setup>
import ChartVis from "@/components/ChartVis.vue";
let props = defineProps(['sheetObject', 'show'])

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