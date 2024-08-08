<template>
  <v-bottom-sheet v-model="chartStore.showChart" inset>
    <v-card v-if="featureStore.activeFeature" height="100%">
      <v-card-item class="text-center">
        <v-card-title>{{ featureStore.activeFeature.properties.river_name }}</v-card-title>
        <v-card-subtitle>
          {{ featureStore.activeFeature.properties.reach_id }}
        </v-card-subtitle>
      </v-card-item>

      <v-card-text>
        <v-container>
          <v-tabs v-model="varTab" align-tabs="center">
            <v-tab
              v-for="variable in selectedVariables"
              :value="variable"
              :key="variable.abbreviation"
            >
              {{ variable.name }}
            </v-tab>
          </v-tabs>
          <v-window v-model="varTab">
            <v-window-item
              v-for="variable in selectedVariables"
              :key="variable.abbreviation"
              :value="variable"
            >
              <LineChart
                v-if="variable"
                id="chart"
                :data="chartStore.chartData"
                :chosenVariable="variable"
              />
            </v-window-item>
          </v-window>
        </v-container>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>
<script setup>
import LineChart from '@/components/LineChart.vue'
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { useChartsStore } from '@/stores/charts'
import { useHydrologicStore } from '@/stores/hydrologic'
import { storeToRefs } from 'pinia'

const featureStore = useFeaturesStore()
const chartStore = useChartsStore()
const hydrologicStore = useHydrologicStore()

const { selectedVariables } = storeToRefs(hydrologicStore)
let varTab = ref(selectedVariables[0])
</script>

<style scoped>
#chart {
  height: 40vh;
}
</style>
