<template>
  <v-bottom-sheet v-model="showSheet" inset>
    <v-btn @click="showSheet = false">
      close
    </v-btn>
    <v-card class="text-center" height="100%">
      <v-card-title>
        <h3>Feature</h3>
      </v-card-title>
      <v-card-text>
        <!-- TODO: single feature plot -->
          <ChartVis />
      </v-card-text>
    </v-card>
    <v-card>
      <v-row>
        <v-col cols="auto">
          <v-card class="mx-auto" variant="elevated" outlined>
            <v-card-item>
              <v-card-title>{{ featureStore.activeFeature.sword.river_name }}</v-card-title>
              <v-card-subtitle>
                {{ featureStore.activeFeature.sword.reach_id }}
              </v-card-subtitle>
            </v-card-item>

            <v-card-text>
              <v-expansion-panels>
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <div>SWORD Info</div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div v-for="(value, key, i) in featureStore.activeFeature.sword" :key="i">
                      <v-divider v-if="i < Object.keys(featureStore.activeFeature.sword).length - 1" />
                      <div>{{ key }}: {{ value }}</div>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <div>HydroCron Query</div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div v-for="(value, key, i) in featureStore.activeFeature.params" :key="i">
                      <v-divider v-if="i < Object.keys(featureStore.activeFeature.params).length - 1" />
                      <div>{{ key }}: {{ value }}</div>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <div>SWOT Data ({{ featureStore.activeFeature.hits }} points)</div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div v-for="swotFeature in featureStore.activeFeature.results.geojson.features" :key="swotFeature.index">
                      <div v-for="(value, key, i) in swotFeature.properties" :key="i">
                        <v-divider v-if="i < Object.keys(swotFeature.properties).length - 1" />
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
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'

const featureStore = useFeaturesStore()

let showSheet = ref(false)

// subscribe to the active feature
featureStore.$subscribe((mutation, state) => {
  if (state.activeFeatureFeature !== null) {
    showSheet.value = true
  }
})

</script>