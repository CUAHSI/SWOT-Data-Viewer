import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVisStore = defineStore('vis', () => {
  const visData = ref({})

  const updateVisData = (data) => {
    visData.value = data
  }

  const clearVisData = () => {
    visData.value = {}
  }
  
  const buildVis = (selectedFeatures) => {
    console.log('Building vis for selected features', selectedFeatures)
    const datasets = getVisDatasets(selectedFeatures)
    const labels = selectedFeatures[0].results.geojson.features.map((feature) => {
      return feature.properties.time_str
    })
    console.log('Labels', labels)
    console.log('Datasets', datasets)
    const data = {
      labels: labels,
      datasets: datasets
    }
    updateVisData(data)
    return data
  }

  const getVisDatasets = (selectedFeatures) => {
    // for each feature in selectedFeatures[0].results.geojson.features, add a point
    return selectedFeatures.map((feature) => {
      return {
        label: `${feature.sword.river_name} | ${feature.sword.reach_id}`,
        data: feature.results.geojson.features.map((feature) => {
          return feature.properties
        }),
        borderColor: dynamicColors()
      }
    })
  }

  const dynamicColors = function () {
    var r = Math.floor(Math.random() * 255)
    var g = Math.floor(Math.random() * 255)
    var b = Math.floor(Math.random() * 255)
    return 'rgb(' + r + ',' + g + ',' + b + ')'
  }

  return {
    updateVisData,
    visData,
    clearVisData,
    buildVis
  }
})
