<template>
  <v-container v-if="hasData" fluid fill-height>
    <v-tabs v-model="chartStore.chartTab" align-tabs="center" fixed-tabs color="primary" grow>
      <v-tab value="timeseries">
        <v-icon :icon="mdiTimelineClock"></v-icon>
        Timeseries
      </v-tab>
      <v-tab value="distance">
        <v-icon :icon="mdiMapMarkerDistance"></v-icon>
        Distance
      </v-tab>
    </v-tabs>
    <TimeSeriesCharts v-if="chartStore.chartTab === 'timeseries'" />
    <DistanceCharts v-if="chartStore.chartTab === 'distance'" />
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

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js'
import { customCanvasBackgroundColor } from '@/_helpers/charts/plugins'
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(LinearScale, TimeScale, PointElement, LineElement, Title, Tooltip, Legend, customCanvasBackgroundColor, zoomPlugin)

const chartStore = useChartsStore();

let sheetText = ref(null)

let hasData = computed(() => chartStore.chartData && chartStore.chartData.datasets?.length > 0)

</script>