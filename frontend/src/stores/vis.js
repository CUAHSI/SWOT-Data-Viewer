import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVisStore = defineStore('vis', () => {
  const chartData = ref({})
  const chart = ref(null)

  const setChart = (chartInstance) => {
    chart.value = chartInstance
  }

  const updateVisData = (data) => {
    chartData.value = data
  }

  const clearVisData = () => {
    chartData.value = {}
  }
  
  const buildVis = (selectedFeatures) => {
    // https://www.chartjs.org/docs/latest/general/data-structures.html#parsing
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
      let measurements = feature.results.geojson.features.map((feature) => {
        return feature.properties
      })
      // TODO: this is a hack to remove the invalid measurements
      measurements = measurements.map((m) => {
        const date = new Date(m.time_str)
        m.time_str = date
        if (isNaN(date)){
          return {}
        }
        if (m.wse == "-999999999999.0") {
          return {}
        }
        return m
      })
      console.log('SWOT measurements', measurements)
      return {
        label: `${feature.sword.river_name} | ${feature.sword.reach_id}`,
        data: measurements,
        parsing: {
          xAxisKey: 'time_str',
          // TODO: this should be dynamic based on the selected variable
          yAxisKey: 'wse'
        },
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
    chartData,
    clearVisData,
    buildVis,
    setChart
  }
})
