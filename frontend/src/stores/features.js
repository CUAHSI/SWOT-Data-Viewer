import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFeaturesStore = defineStore('features', () => {
  const selectedFeatures = ref([])

  function selectFeature(feature) {
    console.log('Feature selected: ' + feature)
    this.selectedFeatures.push(feature)
}

  return { selectedFeatures, selectFeature }
})
