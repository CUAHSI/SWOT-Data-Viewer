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
      const variables = feature.results.geojson.features.map((feature) => {
        return feature.properties
      })
      console.log('SWOT Variables', variables)
      return {
        label: `${feature.sword.river_name} | ${feature.sword.reach_id}`,
        data: variables.map((variable) => {
          // TODO don't just use wse
          return {
            x: variable.time_str,
            y: variable.wse
          }
        }),
        // data: [{x: '2016-12-25', y: 20}, {x: '2016-12-26', y: 10}],
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
