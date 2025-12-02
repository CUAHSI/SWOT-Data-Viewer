<template>
  <v-switch
    v-model="showStatistics"
    label="Statistics"
    color="primary"
    @change="statsStore.toggleSeriesStatistics(showStatistics)"
  >
    <v-tooltip activator="parent" location="start">
      Enable/Disable computed statistics in the long-profile plot.
    </v-tooltip>
  </v-switch>
</template>

<script setup>
import 'chartjs-adapter-date-fns'
import { useChartsStore } from '@/stores/charts'
import { useStatsStore } from '../stores/stats'
import { storeToRefs } from 'pinia'

const chartStore = useChartsStore()
const statsStore = useStatsStore()

const { showStatistics } = storeToRefs(chartStore)
</script>
