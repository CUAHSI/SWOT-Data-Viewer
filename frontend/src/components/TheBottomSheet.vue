<template>
  <v-bottom-sheet v-model="showSheet" inset>
    <v-btn @click="showSheet = false">
      close
    </v-btn>
    <v-card class="text-center" height="100%">
      <v-card-title>
        <h3>Selected Reaches</h3>
      </v-card-title>
      <v-card-text>
          <ChartVis />
      </v-card-text>
    </v-card>
    <v-card>
      <v-row>
        <v-col v-for="(result, i) in featureStore.selectedFeatures" :key="i" cols="auto">
          <v-card class="mx-auto" variant="elevated" outlined>
            <v-card-item>
              <v-card-title>{{ result.sword.river_name }}</v-card-title>
              <v-card-subtitle>
                {{ result.sword.reach_id }}
              </v-card-subtitle>
            </v-card-item>

            <v-card-text>
              <v-expansion-panels>
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <div>SWORD Info</div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div v-for="(value, key, i) in result.sword" :key="i">
                      <v-divider v-if="i < Object.keys(result.sword).length - 1" />
                      <div>{{ key }}: {{ value }}</div>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <div>HydroCron Query</div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div v-for="(value, key, i) in result.params" :key="i">
                      <v-divider v-if="i < Object.keys(result.params).length - 1" />
                      <div>{{ key }}: {{ value }}</div>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <div>Response ({{ result.hits }} hits)</div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div v-for="feature in result.results.geojson.features" :key="feature.index">
                      <div v-for="(value, key, i) in feature.properties" :key="i">
                        <v-divider v-if="i < Object.keys(feature.properties).length - 1" />
                        <div>{{ key }}: {{ value }}</div>
                      </div>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-bottom-sheet>
</template>
<script setup>
import ChartVis from "@/components/ChartVis.vue";
import { ref, watch } from 'vue'
import { useFeaturesStore } from '@/stores/features'

const featureStore = useFeaturesStore()

let selectedFeatures = featureStore.selectedFeatures

let showSheet = ref(false)

// if the sheetObject changes, show the sheet
watch(selectedFeatures, async (newFeatures) => {
  // show the sheet if the new features is not empty
  if (newFeatures !== null && newFeatures.length > 0) {
    showSheet.value = true
  }
})

</script>