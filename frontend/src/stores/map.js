import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMapStore = defineStore('map', () => {
  const mapObject = ref(new Map())
  const featureOptions = ref({
    selectedColor: 'red',
    defaultColor: 'blue',
    weight: 5,
    opacity: 0.7
  })

  const deselectFeature = (feature) => {
    mapObject.value.reachesFeatures.setFeatureStyle(feature.id, {
      color: featureOptions.value.defaultColor
    })
  }

  const selectFeature = (feature) => {
    mapObject.value.reachesFeatures.setFeatureStyle(feature.id, {
      color: featureOptions.value.selectedColor
    })
  }

  const clearAllFeatures = () => {
    mapObject.value.reachesFeatures.eachFeature(function (feature) {
      feature.setStyle({ color: featureOptions.value.defaultColor })
    })
  }

  return { mapObject, deselectFeature, selectFeature, clearAllFeatures, featureOptions }
})
