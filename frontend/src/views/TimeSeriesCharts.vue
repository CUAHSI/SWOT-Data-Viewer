<template>
  <v-container v-if="hasData" fluid fill-height>
    <v-row>
      <!-- Left panel shown only on large screens -->
      <v-col v-if="lgAndUp" :cols="12" :lg="3" :xl="3">
        <v-card class="elevation-1" color="input">
          <v-card-title> Variables </v-card-title>
          <v-tabs v-model="activePlt" direction="vertical" color="primary">
            <v-tab v-for="plt in timeSeriesCharts" :key="plt.abbreviation" :value="plt">
              <template v-if="lgAndUp">
                {{ plt.name }}
              </template>
              <template v-else>
                {{ plt.abbreviation }}
              </template>
              <v-tooltip activator="parent" location="start" max-width="300px">
                {{ plt.help }}
              </v-tooltip>
            </v-tab>
          </v-tabs>
        </v-card>
        <TimeRangeSelector />
        <v-divider v-if="lgAndUp" class="my-2" />
        <PlotOptions />
        <v-divider v-if="lgAndUp" class="my-2" />
        <DataQuality />
        <v-divider v-if="lgAndUp" class="my-2" />
        <PlotActions :chosen-plot="activeReachChart" />
      </v-col>

      <!-- Mobile: slim toggle button attached to the overlay (caret icon) -->
      <v-btn
        v-if="!lgAndUp"
        class="filters-fab"
        :class="{ open: showFilters }"
        elevation="2"
        icon
        :aria-label="showFilters ? 'Close filters' : 'Open filters'"
        :style="{ left: showFilters ? `${drawerWidth}px` : '0px' }"
        @click="showFilters = !showFilters"
      >
        <v-icon v-if="!showFilters" :icon="mdiChevronRight" size="20" color="black" />
        <v-icon v-else :icon="mdiChevronLeft" size="20" color="black" />
      </v-btn>

      <!-- Drawer overlay for mobile filters -->
      <v-navigation-drawer v-model="showFilters" temporary scrim width="320" left>
        <v-toolbar flat>
          <v-toolbar-title>Filters</v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            class="drawer-close-btn"
            aria-label="Close filters"
            @click="showFilters = false"
          >
            <v-icon :icon="mdiClose" size="18" color="black" />
          </v-btn>
        </v-toolbar>
        <v-divider />
        <v-card flat class="pa-2" color="input">
          <v-card-title class="pa-0"> Variables </v-card-title>
          <v-tabs v-model="activePlt" direction="vertical" color="primary">
            <v-tab v-for="plt in timeSeriesCharts" :key="plt.abbreviation" :value="plt">
              <template v-if="lgAndUp">
                {{ plt.name }}
              </template>
              <template v-else>
                {{ plt.abbreviation }}
              </template>
              <v-tooltip activator="parent" location="start" max-width="300px">
                {{ plt.help }}
              </v-tooltip>
            </v-tab>
          </v-tabs>
        </v-card>
        <TimeRangeSelector />
        <v-divider class="my-2" />
        <PlotOptions />
        <v-divider class="my-2" />
        <DataQuality />
        <v-divider class="my-2" />
        <PlotActions :chosen-plot="activeReachChart" />
      </v-navigation-drawer>

      <v-divider v-if="lgAndUp" class="my-2" vertical />
      <v-col :cols="12" :lg="9" :xl="9">
        <v-window v-model="activePlt">
          <v-window-item v-for="plt in timeSeriesCharts" :key="plt.abbreviation" :value="plt">
            <LineChart v-if="plt" class="chart" :data="chartStore.chartData" :chosen-plot="plt" />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import LineChart from '@/components/LineChart.vue'
import PlotOptions from '@/components/PlotOptions.vue'
import PlotActions from '../components/PlotActions.vue'
import DataQuality from '@/components/DataQuality.vue'
import TimeRangeSelector from '@/components/TimeRangeSelector.vue'
import { useChartsStore } from '../stores/charts'
import { useFeaturesStore } from '@/stores/features'
import { useDisplay } from 'vuetify'
import { onMounted, computed, ref } from 'vue'
import { mdiChevronRight, mdiChevronLeft, mdiClose } from '@mdi/js'
import { storeToRefs } from 'pinia'

const { lgAndUp } = useDisplay()
const chartStore = useChartsStore()
const featuresStore = useFeaturesStore()

const { activePlt, activeReachChart, reachCharts, lakeCharts } = storeToRefs(chartStore)
const { activeFeature } = storeToRefs(featuresStore)

let hasData = computed(() => chartStore.chartData && chartStore.chartData.datasets?.length > 0)

let timeSeriesCharts = computed(() => {
  // decide which charts to show based on feature type
  if (activeFeature.value?.feature_type === 'PriorLake') {
    return lakeCharts.value
  }
  return reachCharts.value
})

onMounted(() => {})
const drawerWidth = 320
const showFilters = ref(false)
</script>

<style scoped>
.chart {
  height: 100%;
}

.filters-fab {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1200;
  background: #ffffff;
  color: #000;
  border: 1px solid rgba(0, 0, 0, 0.12);
  width: 32px;
  height: 48px;
  min-width: 36px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    left 0.12s ease,
    transform 0.12s ease,
    background 0.12s ease;
  padding: 0;
}
.filters-fab.open {
  transform: translateY(-50%) scale(1.02);
  background: #f5f5f5;
}

.filters-fab .v-icon {
  font-size: 20px;
  color: #000;
  line-height: 1;
}
.drawer-close-icon {
  font-size: 16px;
  color: #000;
}

.drawer-close-btn {
  color: rgba(0, 0, 0, 0.7);
}
</style>
