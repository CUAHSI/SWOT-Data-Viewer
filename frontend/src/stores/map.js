import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMapStore = defineStore('map', () => {
  const mapObject = ref(new Map())

  const deselectFeature = (feature) => {
    mapObject.value.reachesFeatures.setFeatureStyle(feature.id, {
      color: 'blue',
      weight: 3,
      opacity: 1
    })
  }

  const selectFeature = (feature) => {
    mapObject.value.reachesFeatures.setFeatureStyle(feature.id, {
      color: 'red',
      weight: 3,
      opacity: 1
    })
  }

  const clearAllFeatures = () => {
    mapObject.value.reachesFeatures.eachFeature(function (feature) {
      feature.setStyle({ color: 'blue', weight: 3, opacity: 1 })
    })
  }

  return { mapObject, deselectFeature, selectFeature, clearAllFeatures }
})
