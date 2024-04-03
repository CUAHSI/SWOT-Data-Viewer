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
    // TODO: need to update just for the newly selected feature: this currently will re-map all selected features
    return selectedFeatures.map((feature) => {
      const variables = feature.results.geojson.features.map((feature) => {
        return feature.properties
      })
      console.log('SWOT Variables', variables)
      return {
        label: `${feature.sword.river_name} | ${feature.sword.reach_id}`,
        data: variables.map((variable) => {
          // TODO don't just use wse
          const wse = variable.wse > 0 ? variable.wse : 0
          let date = Date.parse(variable.time_str)
          if (isNaN(date)) {
            return {}
          }
          return {
            x: date,
            y: wse
          }
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
