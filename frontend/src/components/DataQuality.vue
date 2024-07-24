<template>

  <v-expansion-panels with="100%" v-model="panel" multiple flat>
    <v-expansion-panel value="0">
      <v-expansion-panel-title>Data Quality</v-expansion-panel-title>
        <v-expansion-panel-text>
          <!-- create list of dataQuality options -->
          <v-list density="compact" slim>
            <v-list-item v-for="item in chartStore.dataQualityOptions" :key="item.value" density="compact" slim>
              <v-list-item-action>
                <v-checkbox
                  v-model="dataQuality"
                  :label="item.label"
                  :value="item.value"
                  @update:modelValue="qualityHasChanged()">
                <template #append>
                  <v-icon :icon="item.icon" :color="item.pointBorderColor" size="x-small"></v-icon>
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
import { ref } from 'vue'

const chartStore = useChartsStore()
const props = defineProps({ data: Object, chosenVariable: Object })
const dataQuality = ref([0, 1, 2, 3])
const emit = defineEmits(['qualityUpdated']);

function qualityHasChanged() {
  // emit the qualityUpdated event when the ndataQuality value changes
  emit("qualityUpdated", dataQuality.value);
}

</script>

