<template>
  <v-container v-if="loading">
    <h2 class="text-center ma-2">
      <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
      Loading node level data...
    </h2>
    <v-skeleton-loader height="70vh" type="image, divider, list-item-two-line" />
  </v-container>
  <v-container v-else fluid fill-height>
    <v-row>
      <v-col sm="2">
        <v-sheet class="elevation-1" color="input">
          <v-card-title>
            Variables
          </v-card-title>
          <v-tabs v-model="varTab" direction="vertical" color="primary">
            <v-tab v-for="variable in nodeVariables" :value="variable" :key="variable.abbreviation">
              <template v-if="lgAndUp">
                {{ variable.plot_definition }}
              </template>
              <template v-else>
                {{ variable.abbreviation }}
              </template>
            </v-tab>
          </v-tabs>
        </v-sheet>
        <v-divider class="my-2" v-if="lgAndUp"></v-divider>
        <v-card class="pa-2" v-if="lgAndUp">
          {{ varTab.definition }}
        </v-card>
      </v-col>
      <v-divider class="my-2" vertical v-if="lgAndUp"></v-divider>
      <v-col sm="10">
        <v-window v-model="varTab">
          <v-window-item v-for="variable in nodeVariables" :key="variable.abbreviation" :value="variable">
            <NodeChart v-if="variable" class="chart" :data="chartStore.nodeChartData" :chosenVariable="variable" />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import NodeChart from '@/components/NodeChart.vue'
import { useChartsStore } from '../stores/charts';
import { useHydrologicStore } from '@/stores/hydrologic'
import { ref, onMounted } from 'vue'
import { useDisplay } from 'vuetify'

const { lgAndUp } = useDisplay()
const chartStore = useChartsStore();
const hydrologicStore = useHydrologicStore();


// TODO:nodes on tab switch, update distance chart data by query nodes
let loading = ref(true)

let nodeVariables = hydrologicStore.getPlottableSwordVariables('node')
console.log("Node Variables", nodeVariables)
let varTab = ref(nodeVariables[0])

onMounted(async () => {
  if (chartStore.nodeChartData.value !== undefined && chartStore.nodeChartData.value.datasets.length > 0) {
    loading.value = false
    return
  }
  // TODO:nodes subscribe to chartStore.nodeChartData.value.datasets
  loading.value = false

})

</script>

<style scoped>
.chart {
  height: 100%;
}
</style>