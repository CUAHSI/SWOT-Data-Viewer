<template>
  <v-container v-if="chartStore.hasNodeData" fluid fill-height>
    <v-row>
      <v-col sm="2">
        <v-sheet class="elevation-1" color="input">
          <v-card-title>
            Variables
          </v-card-title>
          <v-tabs v-model="varTab" direction="vertical" color="primary">
            <v-tab v-for="variable in nodeVariables" :value="variable" :key="variable.abbreviation">
              <template v-if="lgAndUp">
                {{ variable.name }}
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
import { useChartsStore } from '../stores/charts';
import { useHydrologicStore } from '@/stores/hydrologic'
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

const { lgAndUp } = useDisplay()
const chartStore = useChartsStore();
const hydrologicStore = useHydrologicStore();


// TODO:nodes on tab switch, update distance chart data by query nodes
let nodeVariables = hydrologicStore.getPlottableSwotVariables('node')
let varTab = ref(nodeVariables[0])

</script>

<style scoped>
.chart {
  height: 100%;
}
</style>