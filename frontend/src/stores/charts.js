import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChartsStore = defineStore('charts', () => {
  const chartData = ref({})
  const chart = ref(null)
  const showChart = ref(false)

  const setChart = (chartInstance) => {
    chart.value = chartInstance
  }

  const updateChartData = (data) => {
    chartData.value = data
  }

  const clearChartData = () => {
    chartData.value = {}
  }

  const buildChart = (selectedFeatures) => {
    // https://www.chartjs.org/docs/latest/general/data-structures.html#parsing
    console.log('Building vis for selected features', selectedFeatures)
    const datasets = getChartDatasets(selectedFeatures)
    const labels = selectedFeatures[0].results.geojson.features.map((feature) => {
      if (feature.properties.time_str == 'no_data') {
        return
      }
      return feature.properties.time_str
    })
    console.log('Labels', labels)
    console.log('Datasets', datasets)
    const data = {
      labels: labels,
      datasets: datasets
    }
    updateChartData(data)
    return data
  }

  const getChartDatasets = (selectedFeatures) => {
    // TODO: need to update just for the newly selected feature: this currently will re-map all selected features
    return selectedFeatures.map((feature) => {
      let measurements = feature.results.geojson.features.map((feature) => {
        return feature.properties
      })
      // TODO: this is a hack to remove the invalid measurements
      // need to handle this with a formal validator
      measurements = measurements.map((m) => {
        m.datetime = new Date(m.time_str)
        if (m.time_str == 'no_data') {
          return
        }
        if (isNaN(m.datetime)) {
          return
        }
        if (m.wse == '-999999999999.0') {
          return
        }
        return m
      })
      console.log('SWOT measurements', measurements)
      return {
        label: `${feature.sword.river_name} | ${feature.sword.reach_id}`,
        data: measurements,
        parsing: {
          xAxisKey: 'datetime',
          // TODO: this should be dynamic based on the selected variable
          yAxisKey: 'wse'
        },
        borderColor: dynamicColors(),
        // showLine: false,
      }
    })
  }

  const showVis = () => {
    showChart.value = true
  }

  const dynamicColors = function () {
    var r = Math.floor(Math.random() * 255)
    var g = Math.floor(Math.random() * 255)
    var b = Math.floor(Math.random() * 255)
    return 'rgb(' + r + ',' + g + ',' + b + ')'
  }

  const getChart = () => {
    return chart
  }

  return {
    updateChartData,
    chartData,
    clearChartData,
    buildChart,
    setChart,
    showVis,
    showChart,
    getChart,
    chart
  }
})
