<template>
  <v-sheet class="mx-auto" elevation="8">
    <v-card v-if="featureStore.activeFeature" height="100%">
      <v-card-item class="text-center">
        <v-card-title>{{ getFeatureName() }}</v-card-title>
        <!-- <v-card-subtitle>
                  {{ featureStore.activeFeature.sword.reach_id }}
                </v-card-subtitle> -->
      </v-card-item>
      <v-card-text>
        <div v-for="metadataObject in defaultSwordMetadata(true)" :key="metadataObject.id">
          <v-divider />
          <div><strong>{{ metadataObject.short_definition }}:</strong> {{ metadataObject.value }}</div>
        </div>
      </v-card-text>
    </v-card>
  </v-sheet>
</template>

<script setup>
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { useHydrologicStore } from '@/stores/hydrologic'

const featureStore = useFeaturesStore()
const hydrologicStore = useHydrologicStore()

let show = ref(false)



const defaultSwordMetadata = () => {
  if (!featureStore.activeFeature) return {}
  // TODO assumes reach, won't work for nodes
  return hydrologicStore.getSwordDescriptions(featureStore.activeFeature.sword, true, 'reach')
}

const getFeatureName = () => {
  if (!featureStore.activeFeature) return ''
  const river_name = featureStore.activeFeature.sword.river_name
  if (river_name === 'NODATA') {
    return 'UNNAMED REACH'
  }
  return river_name
}


featureStore.$subscribe((mutation, state) => {
  if (state.activeFeature !== null) {
    // && typeof mutation.events.newValue === 'object'
    show.value = true
  }
})

</script>


<style scoped>
#chart {
  height: 40vh;
}

.v-navigation-drawer--mini-variant,
.v-navigation-drawer {
  overflow: visible !important;
}
</style>