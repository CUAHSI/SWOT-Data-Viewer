<template>
  <v-container v-if="hasFeatures">
    <v-row>
      <v-col v-for="variable in selectedVariables" :key="variable">
        {{ variable.name }}
        <LineChart class="chart" :chosen-plot="variable" />
      </v-col>
    </v-row>
  </v-container>

  <v-container v-else>
    <v-sheet border="md" class="pa-6 mx-auto ma-4" max-width="1200" rounded>
      <span>
        You don't have any data to view yet. Use the
        <router-link :to="{ path: `/` }">Map</router-link> to make selections.
      </span>
    </v-sheet>
  </v-container>
</template>

<script setup>
import LineChart from '@/components/LineChart.vue'
import { useFeaturesStore } from '../stores/features'
import { useHydrologicStore } from '@/stores/hydrologic'
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

const featureStore = useFeaturesStore()
const hydrologicStore = useHydrologicStore()

let hasFeatures = computed(() => featureStore.selectedFeatures.length > 0)

const { selectedVariables } = storeToRefs(hydrologicStore)
</script>

<style scoped>
.chart {
  height: 70vh;
}
</style>
