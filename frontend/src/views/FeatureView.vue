<template>
  <v-container v-if="queryingFeatures" class="pa-4">
    <v-progress-circular indeterminate color="primary" />
    <h2 class="text-center">Loading feature data...</h2>
  </v-container>
  <v-container
    v-else
    fluid
    fill-height
    border="md"
    class="pa-6 mx-auto ma-4"
    max-width="1200"
    rounded
  >
    <StaticMetadata :feature-id="$route.params.featureId" />
    <DynamicData />
  </v-container>
</template>

<script setup>
import StaticMetadata from '@/components/StaticMetadata.vue'
import DynamicData from '../components/DynamicData.vue'
import { useFeaturesStore } from '../stores/features'
import { useRouter } from 'vue-router'
import { watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const props = defineProps({ featureId: String })
const router = useRouter()

const featuresStore = useFeaturesStore()
const { activeFeature } = storeToRefs(featuresStore)

const queryingFeatures = ref(true)

// use a watcher to run the query once the active feature is set
// we do this because it seems that async queries from esri leaflet
// are not properly returning a promise to await
watch(activeFeature, async (newActiveFeature, oldActiveFeature) => {
  if (newActiveFeature) {
    console.log('Active feature changed from', oldActiveFeature, 'to', newActiveFeature)
    queryingFeatures.value = false
  }
})

onMounted(() => {
  if (activeFeature.value) {
    queryingFeatures.value = false
    // set the reach id in the url from the active feature
    if (props.featureId === '') {
      router.replace({
        params: {
          featureId:
            activeFeature.value.properties.reach_id || activeFeature.value.properties.lake_id
        }
      })
    }
  }
  if (props.featureId && props.featureId !== '') {
    featuresStore.setActiveFeatureById(props.featureId)
  }
})
</script>
