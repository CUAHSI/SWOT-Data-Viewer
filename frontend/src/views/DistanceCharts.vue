<template>
  <v-skeleton-loader v-if="loading" height="70vh" type="image, divider, list-item-two-line" />
  <v-container v-else>
    <v-row>
      <v-col cols="2">
        <v-sheet class="elevation-1">
          <v-card-title>
            Variables
          </v-card-title>
          <v-tabs v-model="varTab" direction="vertical">
            <v-tab v-for="variable in selectedVariables" :value="variable" :key="variable.abbreviation">
              {{ variable.name }}
            </v-tab>
          </v-tabs>
        </v-sheet>
      </v-col>
      <v-divider class="my-2" vertical></v-divider>
      <v-col>
        <v-window v-model="varTab">
          <v-window-item v-for="variable in selectedVariables" :key="variable.abbreviation" :value="variable">
            <LineChart v-if="variable" class="chart" :data="chartStore.chartData" :chosenVariable="variable" />
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
import { ref } from 'vue'
import { computed } from 'vue';

const chartStore = useChartsStore();
const hydrologicStore = useHydrologicStore();


// TODO on tab switch, update distance chart data by query nodes
let loading = computed(() => true)

let selectedVariables = hydrologicStore.selectedVariables
let varTab = ref(selectedVariables[0])

</script>

<style scoped>
.chart {
  height: 70vh;
}
</style>