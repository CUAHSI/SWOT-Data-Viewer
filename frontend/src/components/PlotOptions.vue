<template>
  <v-expansion-panels with="100%" multiple>
    <v-expansion-panel value="plotOptions">
      <v-expansion-panel-title>Configuration</v-expansion-panel-title>
      <v-expansion-panel-text>
        <StatisticsToggle v-if="chartStore.chartTab === 'distance'" />
        <v-select
          label="Plot Style"
          v-model="showLineVsPoints"
          :items="[{title: 'Scatter', value: false}, {title: 'Connected', value: true}]"
          @update:modelValue="chartStore.updateLineVsPoints"
        ></v-select>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { useChartsStore } from '@/stores/charts'
import { storeToRefs } from 'pinia'
import StatisticsToggle from './StatisticsToggle.vue'

const chartStore = useChartsStore()
const { showLineVsPoints } = storeToRefs(chartStore)
</script>
