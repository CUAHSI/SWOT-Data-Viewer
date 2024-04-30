<template>
  <v-container v-if="hasData">
    <TimeSeriesCharts v-if="tab === 'timeseries'" />
    <DistanceCharts v-if="tab === 'distance'" />
    <v-tabs v-model="tab" align-tabs="center" fixed-tabs color="primary" grow>
      <v-tab value="timeseries">
        <v-icon :icon="mdiTimelineClock"></v-icon>
        Timeseries
      </v-tab>
      <v-tab value="distance">
        <v-icon :icon="mdiMapMarkerDistance"></v-icon>
        Distance
      </v-tab>
    </v-tabs>
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
import { useChartsStore } from '../stores/charts';
import { RouterLink } from 'vue-router';
import { ref } from 'vue'
import { computed } from 'vue';
import { mdiTimelineClock, mdiMapMarkerDistance } from '@mdi/js'
import TimeSeriesCharts from './TimeSeriesCharts.vue';
import DistanceCharts from './DistanceCharts.vue';

const chartStore = useChartsStore();

let sheetText = ref(null)

let hasData = computed(() => chartStore.chartData && chartStore.chartData.datasets?.length > 0)

let tab = ref('timeseries')

</script>