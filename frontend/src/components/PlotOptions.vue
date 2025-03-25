<template>
  <v-expansion-panels with="100%" multiple>
    <v-expansion-panel value="plotOptions">
      <v-expansion-panel-title>Configuration</v-expansion-panel-title>
      <v-expansion-panel-text>
        <StatisticsToggle v-if="chartStore.chartTab === 'distance'" />
        <v-select
          label="Symbology"
          v-model="symbology"
          :items="['Lines', 'Markers']"
          multiple
          chips
          @update:modelValue="chartStore.updateSymbology"
          :rules="[rules.filter]"
        >
        </v-select>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { useChartsStore } from '@/stores/charts'
import { storeToRefs } from 'pinia'
import StatisticsToggle from './StatisticsToggle.vue'

const chartStore = useChartsStore()
const { symbology } = storeToRefs(chartStore)

const rules = {
  filter: (v) => {
    // TODO: cam-399 we don't currently support showing lines without markers
    if (v.includes('Lines') && !v.includes('Markers')) {
      return 'We do not currently support showing lines without markers.'
    }
    return true
  }
}
</script>
