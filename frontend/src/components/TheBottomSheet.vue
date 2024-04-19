<template>
  <v-bottom-sheet v-model="showSheet" inset>
    <!-- <v-btn @click="showSheet = false">
      close
    </v-btn> -->
    <v-card v-if="featureStore.activeFeature" height="100%">
      <v-card-item class="text-center">
        <v-card-title>{{ featureStore.activeFeature.sword.river_name }}</v-card-title>
        <v-card-subtitle>
          {{ featureStore.activeFeature.sword.reach_id }}
        </v-card-subtitle>
      </v-card-item>

      <v-card-text>
        <v-container>
          <v-tabs v-model="varTab" align-tabs="center">
            <v-tab v-for="variable in selectedVariables" :value="variable" :key="variable.abbreviation">
              {{ variable.name }}
            </v-tab>
          </v-tabs>
          <v-window v-model="varTab">
            <v-window-item v-for="variable in selectedVariables" :key="variable.abbreviation" :value="variable">
              <LineChart v-if="variable" id="chart" :data="chartStore.chartData" :chosenVariable="variable" />
            </v-window-item>
          </v-window>
        </v-container>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>
<script setup>
import LineChart from "@/components/LineChart.vue";
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { useChartsStore } from '@/stores/charts'
import { useHydrologicStore } from '@/stores/hydrologic'

const featureStore = useFeaturesStore()
const chartStore = useChartsStore()
const hydrologicStore = useHydrologicStore()

let showSheet = ref(chartStore.showChart)

let selectedVariables = hydrologicStore.selectedVariables
let varTab = ref(selectedVariables[0])

// subscribe to the active feature
// TODO: turning the "data faker toggle" will pop the bottom sheet because it is a mutation in the feature store
// mutation.events is only available in development, not prod
// https://pinia.vuejs.org/core-concepts/state.html#Subscribing-to-the-state
// https://github.com/vuejs/pinia/discussions/1117

// TODO: this method of showing the bottom sheet will only work once
chartStore.$subscribe((mutation, state) => {
  if (state.showChart) {
    // && typeof mutation.events.newValue === 'object'
    showSheet.value = true
  }
})

</script>

<style scoped>
#chart {
  height: 40vh;
}
</style>