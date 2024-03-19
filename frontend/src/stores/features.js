import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFeaturesStore = defineStore('features', () => {
  const selectedFeatures = ref([])
  const activeFeature = ref(null)
  const shouldFakeData = ref(true)
  const visData = ref({})

  function selectFeature(feature) {
    console.log('Feature selected: ', feature)
    this.selectedFeatures.push(feature)
    this.activeFeature = feature
  }

  const updateVisData = (data) => {
    visData.value = data
  }

  return { selectedFeatures, selectFeature, activeFeature, shouldFakeData, updateVisData, visData }
})
