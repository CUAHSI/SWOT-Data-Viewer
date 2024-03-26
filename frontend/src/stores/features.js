import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFeaturesStore = defineStore('features', () => {
  const selectedFeatures = ref([])
  const activeFeature = ref(null)
  const shouldFakeData = ref(true)
  const visData = ref({})

  function selectFeature(feature) {
    this.selectedFeatures.push(feature)
    this.activeFeature = feature
    console.log('Feature selected: ', feature)
  }

  function deselectFeature(feature) {
    this.selectedFeatures = this.selectedFeatures.filter(f => f.id !== feature.id)
    if (this.activeFeature.id === feature.id) {
      this.activeFeature = null
    }
    console.log('Feature deselected: ', feature)
  }

  const updateVisData = (data) => {
    visData.value = data
  }

  const clearVisData = () => {
    visData.value = {}
  }

  const clearSelectedFeatures = () => {
    selectedFeatures.value = []
    activeFeature.value = null
  }

  const checkFeatureSelected = (feature) => {
    return selectedFeatures.value.some(f => f.id === feature.id)
  }

  return { selectedFeatures, selectFeature, activeFeature, shouldFakeData, updateVisData, visData, clearSelectedFeatures, clearVisData, deselectFeature, checkFeatureSelected }
})
