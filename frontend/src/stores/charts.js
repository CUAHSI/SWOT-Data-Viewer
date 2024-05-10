import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChartsStore = defineStore('charts', () => {
  let chartData = ref({})
  let nodeChartData = ref({})
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

  const getNodeLabels = (nodes) => {
    const labels = nodes.map((node) => {
      return node.attributes.dist_out
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

  const buildDistanceChart = (selectedNodes) => {
    // https://www.chartjs.org/docs/latest/general/data-structures.html#parsing
    console.log('Building vis for selected features', selectedNodes)
    const datasets = getNodeChartDatasets(selectedNodes)
    console.log('Datasets', datasets)
    const data = {
      labels: getNodeLabels(selectedNodes),
      datasets: datasets
    }
    console.log('Node Chart Data', data)
    nodeChartData.value = data
    return data
  }

  const filterDataQuality = (dataQualityFlags, datasets) => {
    console.log('Filtering data quality', dataQualityFlags)
    console.log('Starting Datasets', datasets)
    datasets.forEach((dataset) => {
      console.log('Starting pointstyle', dataset.pointStyle)
      const pointStyles = dataset.data.map((m, i) => {
        let pointStyle = dataset.pointStyle[i]
        if (!dataQualityFlags.includes(parseInt(m.reach_q))) {
          // TODO: need to figure out how to have the connecting line skip the point
          // https://www.chartjs.org/docs/latest/samples/line/segments.html
          pointStyle = false
        } else {
          const styles = getPointStyle(m.reach_q)
          pointStyle = styles.pointStyle
        }
        return pointStyle
      })
      dataset.pointStyle = pointStyles
      console.log('Ending pointstyle', dataset.pointStyle)
    })
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
      console.log('SWOT feature', feature)
      return {
        // TODO: nodes label assumes reach
        label: `${feature?.sword?.river_name} | ${feature?.sword?.reach_id}`,
        data: measurements,
        parsing: {
          xAxisKey: 'datetime',
          // TODO: this should be dynamic based on the selected variable
          yAxisKey: 'wse'
        },
        ...getDataSetStyle(measurements)
      }
    })
  }

  const getNodeChartDatasets = (selectedNodes) => {
    const data = selectedNodes.map((node) => {
      return node.attributes
    })
    const dataSet = {
      label: `${selectedNodes[0].attributes.river_name} | ${selectedNodes[0].attributes.reach_id}`,
      data: data,
      parsing: {
        xAxisKey: 'dist_out',
        yAxisKey: 'wse'
      },
      ...getDataSetStyle(data)
    }
    return [dataSet]
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

  const getPointStyle = (dataQuality) => {
    let pointStyle = 'circle'
    let color = 'black'
    let fill = true
    // Values of 0, 1, 2, and 3 indicate good, suspect, degraded, and bad measurements, respectively
    console.log('Data Quality', dataQuality)
    switch (parseInt(dataQuality)) {
      case 0:
        pointStyle = 'circle'
        color = 'black'
        fill = true
        break
      case 1:
        pointStyle = 'star'
        color = 'black'
        fill = false
        break
      case 2:
        pointStyle = 'crossRot'
        color = 'orange'
        fill = false
        break
      case 3:
        pointStyle = 'cross'
        color = 'red'
        fill = false
        break
    }
    return {
      pointStyle,
      color,
      fill
    }
  }

  const getDataSetStyle = (dataSet) => {
    console.log('Getting data set style', dataSet)
    const styles = {
      colors: [],
      pointStyles: [],
      fills: []
    }
    dataSet.forEach((m) => {
      const { pointStyle, color, fill } = getPointStyle(m.reach_q)
      styles.colors.push(color)
      styles.pointStyles.push(pointStyle)
      styles.fills.push(fill)
    })
    console.log('Styles', styles)
    return {
      showLine: false,
      pointStyle: styles.pointStyles,
      pointRadius: 7,
      pointHoverRadius: 15,
      fill: styles.fills,
      color: styles.colors,
      borderColor: styles.colors,
      backgroundColor: 'rgb(75, 192, 192)',
      // borderWidth: 1,
    }
  }

  return {
    updateChartData,
    chartData,
    nodeChartData,
    clearChartData,
    buildChart,
    buildDistanceChart,
    showVis,
    showChart,
    dynamicColors,
    filterDataQuality
  }
})
