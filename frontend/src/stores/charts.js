import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'

export const useChartsStore = defineStore('charts', () => {
  let chartData = ref({})
  let nodeChartData = ref({})
  const showChart = ref(false)
  const hasNodeData = ref(false)

  const updateChartData = (data) => {
    // TODO: bug in reactivity
    // https://github.com/apertureless/vue-chartjs/issues/1040
    chartData.value = data
    console.log('Updated chart data', chartData.value)
  }

  const clearChartData = () => {
    chartData.value = {}
    chartData.value = {}
    nodeChartData.value = {}
    showChart.value = false
    hasNodeData.value = false
  }

  const getLabels = (selectedFeatures) => {
    // TODO: for now we just use the first query
    const labels = selectedFeatures[0].queries[0].results.geojson.features.map((feature) => {
      if (feature.properties.time_str == 'no_data') {
        return
      }
      return feature.properties.time_str
    })
    return labels.filter((l) => l != undefined)
  }

  const getNodeLabels = (nodes) => {
    const labels = nodes.map((node) => {
      // TODO:nodes this will only grab the first node dist value -- there is variation among the hits
      return node.queries[0].results.geojson.features[0].properties.node_dist
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

  const buildDistanceChart = (nodes) => {
    console.log('Building chart for node-level swot data', nodes)
    const datasets = getNodeChartDatasets(nodes)
    console.log('Datasets', datasets)
    const data = {
      labels: getNodeLabels(nodes),
      datasets: datasets
    }
    console.log('Node Chart Data', data)
    nodeChartData.value = data
    hasNodeData.value = true
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

  const filterMeasurements = (measurements, dataQualityFlags) => {
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
      if (m.width == '-999999999999.0') {
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
    return measurements
  }

  const getChartDatasets = (selectedFeatures, dataQualityFlags = null) => {
    const featureStore = useFeaturesStore()
    // TODO: need to update just for the newly selected feature: this currently will re-map all selected features
    console.log('Getting chart datasets for selected features', selectedFeatures)
    return selectedFeatures.map((feature) => {
      // TODO: for now we just use the first query
      let measurements = feature.queries[0].results.geojson.features.map((feature) => {
        return feature.properties
      })
      measurements = filterMeasurements(measurements, dataQualityFlags)
      console.log('SWOT measurements', measurements)
      console.log('SWOT feature', feature)
      return {
        // TODO: nodes label assumes reach
        label: `${featureStore.getFeatureName(feature)} | ${feature?.feature_id}`,
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

  const getNodeChartDatasets = (nodes) => {
    const featureStore = useFeaturesStore()
    console.log('getting node chart datasets for nodes', nodes)
    // TODO:nodes I was expecting that the node_dist would be constant across timestamps but it isn't
    // https://www.chartjs.org/docs/latest/general/data-structures.html#parsing
    let measurements = nodes.map((node) => {
      console.log('Parsing node', node)
      return node.queries[0].results.geojson.features.map((feature) => {
        return feature.properties
      })
    })
    measurements = measurements.flat()
    measurements = filterMeasurements(measurements)
    console.log('Node measurements parsed', measurements)
    console.log('using reach from ', nodes[0])
    const dataSet = {
      label: `${featureStore.getFeatureName(nodes[0])} | ${nodes[0]?.properties?.reach_id}`,
      data: measurements,
      parsing: {
        xAxisKey: 'node_dist',
        yAxisKey: 'wse'
      },
      ...getDataSetStyle(measurements)
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
      const { pointStyle, color, fill } = getPointStyle(m.reach_q ? m.reach_q : m.node_q)
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
      backgroundColor: 'rgb(75, 192, 192)'
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
    hasNodeData,
    dynamicColors,
    filterDataQuality
  }
})
