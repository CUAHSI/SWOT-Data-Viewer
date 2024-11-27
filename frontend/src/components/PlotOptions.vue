<template>
  <v-expansion-panels with="100%" multiple>
    <v-expansion-panel value="plotOptions">
      <v-expansion-panel-title>Plot Options</v-expansion-panel-title>
      <v-expansion-panel-text>
        <DataQuality
          id="dataQuality"
        />
        <StatisticsToggle v-if="chartStore.chartTab === 'distance'" />
        <v-select
          label="Plot Style"
          v-model="showLine"
          :items="[{title: 'Scatter', value: false}, {title: 'Connected', value: true}]"
          @update:modelValue="chartStore.updateShowLine"
        ></v-select>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { useChartsStore } from '@/stores/charts'
import { storeToRefs } from 'pinia'
import DataQuality from '@/components/DataQuality.vue'
import StatisticsToggle from './StatisticsToggle.vue'


const chartStore = useChartsStore()
const { showLine } = storeToRefs(chartStore)
</script>
