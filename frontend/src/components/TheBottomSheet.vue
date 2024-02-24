<template>
  <v-bottom-sheet v-model="show" inset>
    <v-card class="text-center" height="100%">
      <v-card-text>
        <v-btn @click="show = null">
          close
        </v-btn>

        <br>
        <br>

        <div>
          {{ sheetObject }}
          <ChartVis :data="data" :options="options" />
        </div>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>
<script setup>
import { ref } from 'vue'
import ChartVis from "@/components/ChartVis.vue";
defineProps(['sheetObject'])

let show = ref(true)

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