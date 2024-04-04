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
        <!-- TODO this linechart should only show single plot -->
        <LineChart id="chart" :data="chartStore.chartData" />
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon :icon="mdiSword"></v-icon>
              <span class="ml-2">SWORD Info</span>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-for="(value, key, i) in featureStore.activeFeature.sword" :key="i">
                <v-divider v-if="i < Object.keys(featureStore.activeFeature.sword).length - 1" />
                <div>{{ key }}: {{ value }}</div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon :icon="mdiTimelineClockOutline"></v-icon>
              <span class="ml-2">HydroCron Query</span>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-for="(value, key, i) in featureStore.activeFeature.params" :key="i">
                <v-divider v-if="i < Object.keys(featureStore.activeFeature.params).length - 1" />
                <div>{{ key }}: {{ value }}</div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon :icon="mdiSatelliteVariant"></v-icon>
              <span class="ml-2">SWOT Data ({{ featureStore.activeFeature.hits }} points)</span>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-for="swotFeature in featureStore.activeFeature.results.geojson.features" :key="swotFeature.index">
                <div v-for="(value, key, i) in swotFeature.properties" :key="i">
                  <v-divider v-if="i < Object.keys(swotFeature.properties).length - 1" />
                  <div>{{ key }}: {{ value }}</div>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>
<script setup>
import LineChart from "@/components/LineChart.vue";
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { useChartsStore } from '@/stores/charts'
import { mdiSword, mdiTimelineClockOutline, mdiSatelliteVariant } from '@mdi/js'

const featureStore = useFeaturesStore()
const chartStore = useChartsStore()

let showSheet = ref(false)

// subscribe to the active feature
// TODO: turning the "data faker toggle" will pop the bottom sheet because it is a mutation in the feature store
// mutation.events is only available in development, not prod
// https://pinia.vuejs.org/core-concepts/state.html#Subscribing-to-the-state
// https://github.com/vuejs/pinia/discussions/1117
featureStore.$subscribe((mutation, state) => {
  if (state.activeFeature !== null) {
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