<template>
  <v-container v-if="loading">
    <h2 class="text-center ma-2">
      <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
      Loading node level data...
    </h2>
    <v-skeleton-loader height="70vh" type="image, divider, list-item-two-line" />
  </v-container>
  <v-container v-else>
    <v-row>
      <v-col cols="2">
        <v-sheet class="elevation-1">
          <v-card-title>
            Variables
          </v-card-title>
          <v-tabs v-model="varTab" direction="vertical">
            <v-tab v-for="variable in nodeVariables" :value="variable" :key="variable.abbreviation">
              {{ variable.abbreviation }}
            </v-tab>
          </v-tabs>
        </v-sheet>
      </v-col>
      <v-divider class="my-2" vertical></v-divider>
      <v-col>
        <v-window v-model="varTab">
          <v-window-item v-for="variable in nodeVariables" :key="variable.abbreviation" :value="variable">
            <LineChart v-if="variable" class="chart" :data="chartStore.nodeChartData" :chosenVariable="variable" />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import LineChart from '@/components/LineChart.vue'
import { useChartsStore } from '../stores/charts';
import { useHydrologicStore } from '@/stores/hydrologic'
import { useFeaturesStore } from '@/stores/features'
import { ref, onMounted } from 'vue'
import { getNodesFromReach } from '../_helpers/hydroCron';

const chartStore = useChartsStore();
const hydrologicStore = useHydrologicStore();
const featureStore = useFeaturesStore()


// TODO on tab switch, update distance chart data by query nodes
let loading = ref(true)

let nodeVariables = hydrologicStore.getPlottableSwordVariables('node')
console.log("Node Variables", nodeVariables)
let varTab = ref(nodeVariables[0])

onMounted(async () => {
  console.log("Getting nodes from reach")
  loading.value = true
  const nodes = await getNodesFromReach(featureStore.activeFeature)
  featureStore.nodes = nodes
  console.log("Nodes", featureStore.nodes)
  chartStore.buildDistanceChart(nodes)
  loading.value = false
})

</script>

<style scoped>
.chart {
  height: 70vh;
}
</style>