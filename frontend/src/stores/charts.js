import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChartsStore = defineStore('charts', () => {
  let chartData = ref({})
  const showChart = ref(false)

  const updateChartData = (data) => {
    // TODO: bug in reactivity
    // https://github.com/apertureless/vue-chartjs/issues/1040
    chartData.value = data
    console.log('Updated chart data', chartData.value)
  }

  const clearChartData = () => {
    chartData.value = {}
  }

  const getLabels = (selectedFeatures) => {
    const labels = selectedFeatures[0].results.geojson.features.map((feature) => {
      if (feature.properties.time_str == 'no_data') {
        return
      }
      return feature.properties.time_str
    })
    return labels.filter((l) => l != undefined)
  }

  const buildChart = (selectedFeatures) => {
    // https://www.chartjs.org/docs/latest/general/data-structures.html#parsing
    console.log('Building vis for selected features', selectedFeatures)
    const datasets = getChartDatasets(selectedFeatures)
    console.log('Datasets', datasets)
    const data = {
      labels: getLabels(selectedFeatures),
      datasets: datasets
    }
    updateChartData(data)
    return data
  }

  const filterDataQuality = (dataQualityFlags, datasets) => {
    console.log('Filtering data quality', dataQualityFlags)
    console.log('Starting Datasets', datasets)
    datasets.forEach((dataset) => {
      const pointStyles = dataset.data.map((m) => {
        let pointStyle = 'circle'
        if (!dataQualityFlags.includes(parseInt(m.reach_q))) {
          // TODO: could also set to false to hide the point
          // need to figure out how to have the connecting line skip the point
          // https://www.chartjs.org/docs/latest/samples/line/segments.html
          pointStyle = 'star'
        }
        return pointStyle
      })
      dataset.pointStyle = pointStyles
    })
    console.log('Ending Datasets', datasets)
  }

  const getChartDatasets = (selectedFeatures, dataQualityFlags = null) => {
    // TODO: need to update just for the newly selected feature: this currently will re-map all selected features
    return selectedFeatures.map((feature) => {
      let measurements = feature.results.geojson.features.map((feature) => {
        return feature.properties
      })
      // TODO: this is a hack to remove the invalid measurements
      // need to handle this with a formal validator
      console.log('Starting number of measurements', measurements.length)
      measurements = measurements.filter((m) => {
        if (m.time_str == 'no_data') {
          return false
        }
        m.datetime = new Date(m.time_str)
        if (isNaN(m.datetime)) {
          return false
        }
        if (m.wse == '-999999999999.0') {
          return false
        }
        if (m.slope == '-999999999999.0') {
          return false
        }
        if (m.with == '-999999999999.0') {
          return false
        }
        // check data quality flags
        if (dataQualityFlags != null) {
          if (!dataQualityFlags.includes(parseInt(m.reach_q))) {
            return false
          }
        }
        return true
      })
      console.log('Ending number of measurements', measurements.length)
      console.log('SWOT measurements', measurements)
      return {
        label: `${feature.sword.river_name} | ${feature.sword.reach_id}`,
        data: measurements,
        parsing: {
          xAxisKey: 'datetime',
          // TODO: this should be dynamic based on the selected variable
          yAxisKey: 'wse'
        },
        // borderColor: dynamicColors(),
        borderColor: 'rgb(75, 192, 192)',
        showLine: false,
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 10,
        fill: false
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

  return {
    updateChartData,
    chartData,
    clearChartData,
    buildChart,
    showVis,
    showChart,
    dynamicColors,
    filterDataQuality
  }
})
