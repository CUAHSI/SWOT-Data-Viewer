import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFeaturesStore = defineStore('features', () => {
  const selectedFeatures = ref([])
  const shouldFakeData = ref(true)
  const visData = ref({})

  function selectFeature(feature) {
    console.log('Feature selected: ', feature)
    this.selectedFeatures.push(feature)
  }

  const updateVisData = (data) => {
    visData.value = data
  }

  return { selectedFeatures, selectFeature, shouldFakeData, updateVisData, visData }
})
