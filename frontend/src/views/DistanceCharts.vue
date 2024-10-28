<template>
  <v-container v-if="chartStore.hasNodeData" fluid fill-height>
    <v-row>
      <v-col sm="2">
        <v-sheet class="elevation-1" color="input">
          <v-card-title> Plots </v-card-title>
          <v-tabs v-model="pltTab" direction="vertical" color="primary">
            <v-tab v-for="plt in chartStore.nodeCharts" :value="plt" :key="plt.abbreviation">
              <template v-if="lgAndUp">
                {{ plt.name }}
              </template>
              <template v-else>
                {{ plt.abbreviation }}
              </template>
            </v-tab>
          </v-tabs>
        </v-sheet>
        <v-divider class="my-2" v-if="lgAndUp"></v-divider>
        <v-card class="pa-2" v-if="lgAndUp">
          {{ pltTab.help }}
        </v-card>
      </v-col>
      <v-divider class="my-2" vertical v-if="lgAndUp"></v-divider>
      <v-col sm="10">
        <v-window v-model="pltTab">
          <v-window-item
            v-for="plt in chartStore.nodeCharts"
            :key="plt.abbreviation"
            :value="plt"
          >
            <NodeChart
              v-if="plt"
              class="chart"
              :data="chartStore.nodeChartData"
              :chosenPlot="plt"
            />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
  <v-container v-else>
    <h2 class="text-center ma-2">
      <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
      Loading node level data...
    </h2>
    <v-skeleton-loader height="70vh" type="image, divider, list-item-two-line" />
  </v-container>
</template>

<script setup>
import NodeChart from '@/components/NodeChart.vue'
import { useChartsStore } from '../stores/charts'
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

const { lgAndUp } = useDisplay()
const chartStore = useChartsStore()
let pltTab = ref(chartStore.nodeCharts[0])

</script>

<style scoped>
.chart {
  height: 100%;
}
</style>
