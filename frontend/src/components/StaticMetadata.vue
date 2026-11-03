<template>
  <v-sheet class="mx-auto metadata-sheet" elevation="8">
    <v-card v-if="featureStore.activeFeature" height="100%">
      <v-card-item class="text-center">
        <v-card-title>{{ featureStore.getFeatureName() }}</v-card-title>
        <!-- <v-card-subtitle>
                  {{ featureStore.activeFeature.properties.reach_id }}
                </v-card-subtitle> -->
      </v-card-item>
      <v-card-text>
        <v-row dense>
          <!-- Default Metadata -->
          <v-col
            v-for="metadataObject in defaultSwordMetadata"
            :key="metadataObject.abbreviation"
            cols="6"
          >
            <v-card variant="tonal" class="metadata-card" height="100%">
              <v-card-text class="d-flex align-start justify-space-between pa-2">
                <div>
                  <div class="text-caption text-medium-emphasis metadata-label">
                    {{ metadataObject.displayKey }}
                  </div>
                  <div class="text-body-2 font-weight-medium">
                    {{ metadataObject.value }}
                  </div>
                </div>
                <!-- Tooltip Icon -->
                <v-tooltip location="top" max-width="200px" style="white-space: normal">
                  <template #activator="{ props }">
                    <v-icon
                      v-bind="props"
                      :icon="mdiInformationOutline"
                      color="primary"
                      size="x-small"
                      style="cursor: pointer; margin-left: 6px; flex-shrink: 0"
                    />
                  </template>
                  <div>{{ metadataObject.definition }}</div>
                </v-tooltip>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Extended Metadata -->
          <template v-if="extended">
            <v-col
              v-for="extendedMetadataObject in extendedMetadata"
              :key="extendedMetadataObject.abbreviation"
              cols="6"
              sm="4"
              md="3"
            >
              <v-card variant="tonal" class="metadata-card" height="100%">
                <v-card-text class="d-flex align-start justify-space-between pa-2">
                  <div>
                    <div class="text-caption text-medium-emphasis metadata-label">
                      {{ extendedMetadataObject.displayKey }}
                    </div>
                    <div class="text-body-2 font-weight-medium">
                      {{ extendedMetadataObject.value }}
                    </div>
                  </div>
                  <!-- Tooltip Icon -->
                  <v-tooltip location="top" max-width="200px" style="white-space: normal">
                    <template #activator="{ props }">
                      <v-icon
                        v-bind="props"
                        :icon="mdiInformationOutline"
                        color="primary"
                        size="x-small"
                        style="cursor: pointer; margin-left: 6px; flex-shrink: 0"
                      />
                    </template>
                    <span>{{ extendedMetadataObject.definition }}</span>
                  </v-tooltip>
                </v-card-text>
              </v-card>
            </v-col>
          </template>
        </v-row>
      </v-card-text>
    </v-card>
  </v-sheet>
  <v-btn v-if="!extended" color="primary" @click="extended = true">
    <v-icon :icon="mdiSword" />Metadata
  </v-btn>
  <v-btn v-else color="primary" @click="extended = false">
    <v-icon :icon="mdiSword" />Hide Extended Metadata
  </v-btn>
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

let extended = ref(false)

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

<style scoped>
.metadata-sheet {
  max-width: 360px;
}

.metadata-card {
  border-radius: 8px;
}

.metadata-label {
  line-height: 1.2;
  margin-bottom: 2px;
}
</style>
