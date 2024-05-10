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
        <div v-for="metadataObject in defaultSwordMetadata()" :key="metadataObject.id">
          <v-divider />
          <div><strong>{{ metadataObject.short_definition }}:</strong> {{ metadataObject.value }}</div>
        </div>
        <template v-if="extended">
          <div v-for="extendedMetadataObject in extendedMetadata()" :key="extendedMetadataObject.id">
            <v-divider />
            <div><strong>{{ extendedMetadataObject.short_definition }}:</strong> {{ extendedMetadataObject.value }}
            </div>
          </div>
        </template>
      </v-card-text>
    </v-card>
  </v-sheet>
  <v-btn v-if="!extended" @click="extendMetadata" color="primary"><v-icon :icon="mdiSword"></v-icon>Metadata</v-btn>
  <v-btn v-else @click="extended = false" color="primary"><v-icon :icon="mdiSword"></v-icon>Hide Extended Metadata</v-btn>
</template>

<script setup>
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { useHydrologicStore } from '@/stores/hydrologic'
import { mdiSword } from '@mdi/js'

const featureStore = useFeaturesStore()
const hydrologicStore = useHydrologicStore()

let extended = ref(false)

const extendMetadata = () => {
  if (!featureStore.activeFeature) return
  extendedMetadata.value = hydrologicStore.getSwordDescriptions(featureStore.activeFeature.sword, false, 'reach')
  extended.value = true
}

const extendedMetadata = () => {
  if (!featureStore.activeFeature) return {}
  // TODO:nodes assumes reach, won't work for nodes
  return hydrologicStore.getSwordDescriptions(featureStore.activeFeature.sword, false, 'reach')
}

const defaultSwordMetadata = () => {
  if (!featureStore.activeFeature) return {}
  // TODO:nodes assumes reach, won't work for nodes
  return hydrologicStore.getSwordDescriptions(featureStore.activeFeature.sword, true, 'reach')
}

const getFeatureName = () => {
  if (!featureStore.activeFeature) return ''
  const river_name = featureStore.activeFeature.sword.river_name
  if (river_name === 'NODATA') {
    return 'UNNAMED RIVER'
  }
  return river_name
}

</script>