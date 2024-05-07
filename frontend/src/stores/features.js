import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useMapStore } from '@/stores/map'

export const useFeaturesStore = defineStore('features', () => {
  const selectedFeatures = ref([])
  const activeFeature = ref(null)
  const shouldFakeData = ref(false)
  const nodes = ref([])

  const mapStore = useMapStore()

  function selectFeature(feature) {
    mapStore.selectFeature(feature)
    this.selectedFeatures.push(feature)
    this.activeFeature = feature
    console.log('Feature selected: ', feature)
  }

  function deselectFeature(feature) {
    mapStore.deselectFeature(feature)
    this.selectedFeatures = this.selectedFeatures.filter((f) => f.id !== feature.id)
    if (this.activeFeature.id === feature.id) {
      this.activeFeature = null
    }
    console.log('Feature deselected: ', feature)
  }

  function mergeFeature(feature) {
    console.log('Merging feature', feature)
    const index = selectedFeatures.value.findIndex((f) => f.id === feature.id)
    if (index !== -1) {
      console.log('Feature already exists in selected features')
      selectedFeatures.value[index] = feature
    } else {
      console.log('Feature does not exist in selected features')
      selectedFeatures.value.push(feature)
    }
    this.activeFeature = feature
  }

  const clearSelectedFeatures = () => {
    selectedFeatures.value = []
    activeFeature.value = null
    mapStore.clearAllFeatures()
  }

  const checkFeatureSelected = (feature) => {
    return selectedFeatures.value.some((f) => f.id === feature.id)
  }

  return {
    selectedFeatures,
    selectFeature,
    activeFeature,
    shouldFakeData,
    clearSelectedFeatures,
    deselectFeature,
    checkFeatureSelected,
    mergeFeature,
    nodes,
  }
})
