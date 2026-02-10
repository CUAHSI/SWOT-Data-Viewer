<template>
  <v-expansion-panels v-model="panel" with="100%" multiple flat>
    <v-expansion-panel value="0">
      <v-expansion-panel-title>Data Quality</v-expansion-panel-title>
      <v-expansion-panel-text>
        <!-- create list of dataQuality options -->
        <v-list class="data-quality-list" density="compact" slim>
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
                class="data-quality-checkbox"
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

<style scoped>
.data-quality-checkbox {
  width: 100%;
}

.data-quality-checkbox :deep(.v-label) {
  white-space: nowrap;
  line-height: 1;
  font-size: 0.9rem;
}

.data-quality-list :deep(.v-list-item) {
  padding-inline: 0;
  min-height: 28px;
}

.data-quality-list :deep(.v-list-item__content) {
  padding-block: 2px;
}
</style>
