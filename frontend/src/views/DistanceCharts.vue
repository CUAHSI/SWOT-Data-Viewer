<template>
  <v-container v-if="hasData">
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

  <v-container v-if="!hasData">
    <v-sheet border="md" class="pa-6 mx-auto ma-4" max-width="1200" rounded>
      <span>
        You don't have any data to view yet.
        Use the <router-link :to="{ path: `/` }">Map</router-link> to make selections.
      </span>
    </v-sheet>
  </v-container>

  <v-bottom-sheet v-model="sheetText" inset>
    <v-card class="text-center" height="100%">
      <v-card-text>
        <v-btn @click="sheetText = null">
          close
        </v-btn>

        <br>
        <br>

        <div>
          {{ sheetText }}
        </div>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup>
import LineChart from '@/components/LineChart.vue'
import { useChartsStore } from '../stores/charts';
import { useHydrologicStore } from '@/stores/hydrologic'
import { RouterLink } from 'vue-router';
import { ref } from 'vue'
import { computed } from 'vue';

const chartStore = useChartsStore();
const hydrologicStore = useHydrologicStore();

let sheetText = ref(null)

let hasData = computed(() => chartStore.chartData && chartStore.chartData.datasets?.length > 0)

let selectedVariables = hydrologicStore.selectedVariables
let varTab = ref(selectedVariables[0])

</script>

<style scoped>
.chart {
  height: 70vh;
}
</style>