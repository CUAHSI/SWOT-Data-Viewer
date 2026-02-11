<template>
  <v-expansion-panels v-model="panel" with="100%" multiple flat>
    <v-expansion-panel value="0">
      <v-expansion-panel-title>Data Quality</v-expansion-panel-title>
      <v-expansion-panel-text>
        <!-- create list of dataQuality options -->
        <v-list density="compact" slim>
          <v-list-item
            v-for="item in chartStore.dataQualityOptions"
            :key="item.value"
            density="compact"
            slim
          >
            <v-list-item-action>
              <v-checkbox
                v-model="dataQualityFlags"
                :label="item.label"
                :value="item.value"
                @update:model-value="qualityHasChanged()"
              >
                <template #append>
                  <v-icon :icon="item.icon" :color="item.pointBorderColor" size="small" />
                </template>
              </v-checkbox>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { useChartsStore } from '@/stores/charts'
import { useStatsStore } from '../stores/stats'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

const chartStore = useChartsStore()
const statsStore = useStatsStore()
const { dataQualityFlags, showStatistics } = storeToRefs(chartStore)
const panel = ref([])

function qualityHasChanged() {
  // emit the qualityUpdated event when the ndataQuality value changes
  chartStore.dataQualityFilterAllDatasets()

  // apply the time slider filter to the data
  chartStore.filterDatasetsToTimeRange()
  chartStore.refreshAllCharts()

  // stats are not shown after update of data quality
  statsStore.toggleSeriesStatistics(showStatistics.value)
}
</script>
