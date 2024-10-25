<template>
  <v-container v-if="hasData" fluid fill-height>
    <v-row>
      <v-col sm="2">
        <v-card class="elevation-1" color="input">
          <v-card-title> Variables </v-card-title>
          <v-tabs v-model="pltTab" direction="vertical" color="primary">
            <v-tab
              v-for="plt in chartStore.reachCharts"
              :value="plt"
              :key="plt.abbreviation"
            >
              <template v-if="lgAndUp">
                {{ plt.name }}
              </template>
              <template v-else>
                {{ plt.abbreviation }}
              </template>
            </v-tab>
          </v-tabs>
        </v-card>
        <v-divider class="my-2" v-if="lgAndUp"></v-divider>
        <v-card class="pa-2" v-if="lgAndUp">
          {{ pltTab.help }}
        </v-card>
      </v-col>
      <v-divider class="my-2" vertical v-if="lgAndUp"></v-divider>
      <v-col sm="10">
        <v-window v-model="pltTab">
          <v-window-item
            v-for="plt in reachCharts"
            :key="plt.abbreviation"
            :value="plt"
          >
            <LineChart
              v-if="plt"
              class="chart"
              :data="chartStore.chartData"
              :chosenVariable="plt"
            />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import LineChart from '@/components/LineChart.vue'
import { useChartsStore } from '../stores/charts'
import { useHydrologicStore } from '@/stores/hydrologic'
import { ref } from 'vue'
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

const { lgAndUp } = useDisplay()
const chartStore = useChartsStore()
const hydrologicStore = useHydrologicStore()

let hasData = computed(() => chartStore.chartData && chartStore.chartData.datasets?.length > 0)

let reachCharts = chartStore.reachCharts
let pltTab = ref(reachCharts[0])
//let selectedVariables = hydrologicStore.selectedVariables
//let varTab = ref(selectedVariables[0])
</script>

<style scoped>
.chart {
  height: 100%;
}
</style>
