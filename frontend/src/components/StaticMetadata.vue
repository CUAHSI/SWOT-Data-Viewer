<template>
  <v-sheet class="mx-auto" elevation="8">
    <v-card v-if="featureStore.activeFeature" height="100%">
      <v-card-item class="text-center">
        <v-card-title>{{ featureStore.getFeatureName() }}</v-card-title>
        <!-- <v-card-subtitle>
                  {{ featureStore.activeFeature.properties.reach_id }}
                </v-card-subtitle> -->
      </v-card-item>
      <v-card-text>
        <!-- Default Metadata -->
        <div v-for="metadataObject in defaultSwordMetadata" :key="metadataObject.id">
          <v-divider />
          <div style="display: flex; align-items: center; justify-content: space-between">
            <div>
              <strong>{{ metadataObject.displayKey }}:</strong> {{ metadataObject.value }}
            </div>
            <!-- Tooltip Icon -->
            <v-tooltip location="top" max-width="200px" style="white-space: normal">
              <template #activator="{ props }">
                <v-icon
                  v-bind="props"
                  :icon="mdiInformationOutline"
                  color="primary"
                  style="cursor: pointer; margin-left: 10px"
                >
                </v-icon>
              </template>
              <div>{{ metadataObject.definition }}</div>
            </v-tooltip>
          </div>
        </div>
        <!-- Extended Metadata -->
        <template v-if="extended">
          <div v-for="extendedMetadataObject in extendedMetadata" :key="extendedMetadataObject.id">
            <v-divider />
            <div style="display: flex; align-items: center; justify-content: space-between">
              <div>
                <strong>{{ extendedMetadataObject.displayKey }}:</strong>
                {{ extendedMetadataObject.value }}
              </div>
              <!-- Tooltip Icon -->
              <v-tooltip location="top" max-width="200px" style="white-space: normal">
                <template #activator="{ props }">
                  <v-icon
                    v-bind="props"
                    :icon="mdiInformationOutline"
                    color="primary"
                    style="cursor: pointer; margin-left: 10px"
                  >
                  </v-icon>
                </template>
                <span>{{ extendedMetadataObject.definition }}</span>
              </v-tooltip>
            </div>
          </div>
        </template>
      </v-card-text>
    </v-card>
  </v-sheet>
  <v-btn v-if="!extended" @click="handleMetadataClick(true)" color="primary">
    <v-icon :icon="mdiSword"></v-icon>Metadata
  </v-btn>
  <v-btn v-else @click="extended = false" color="primary"
    ><v-icon :icon="mdiSword"></v-icon>Hide Extended Metadata</v-btn
  >
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { useHydrologicStore } from '@/stores/hydrologic'
import { mdiSword, mdiInformationOutline } from '@mdi/js'

const props = defineProps({
  reachId: { type: Number, default: 0 }
})

const featureStore = useFeaturesStore()
const hydrologicStore = useHydrologicStore()

const extended = ref(false)

const handleMetadataClick = (isExtended) => {
  try {
    window.heap.track('Metadata Extended Event', {
      action: isExtended ? 'View Metadata' : 'Hide Metadata'
    })
  } catch (e) {
    console.warn(
      'Heap is not available or an error occurred while tracking the Metadata Extended Event.',
      e
    )
  } finally {
    extended.value = isExtended
  }
}

if (props.reachId) {
  featureStore.setActiveFeatureById(props.reachId)
}

const extendedMetadata = computed(() => {
  if (!featureStore.activeFeature) return {}
  return hydrologicStore.getSwordDescriptions(
    featureStore.activeFeature,
    false,
    featureStore.activeFeature.feature_type
  )
})

const defaultSwordMetadata = computed(() => {
  if (!featureStore.activeFeature) return {}
  return hydrologicStore.getSwordDescriptions(
    featureStore.activeFeature,
    true,
    featureStore.activeFeature.feature_type
  )
})
</script>
