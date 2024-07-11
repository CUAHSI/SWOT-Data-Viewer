import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { NODE_DATETIME_VARIATION } from '@/constants'
import { addMinutes, subMinutes } from 'date-fns'
import chroma from 'chroma-js'

export const useChartsStore = defineStore('charts', () => {
  let chartData = ref({})
  let nodeChartData = ref({})
  const showChart = ref(false)
  const hasNodeData = ref(false)
  const chartTab = ref('timeseries')

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

  const getTitle = () => {
    const featureStore = useFeaturesStore()
    const feature = featureStore.selectedFeatures[0]
    return `${featureStore.getFeatureName(feature)} | ${feature?.feature_id}`
  }

  const getNodeLabels = (nodes) => {
    const labels = nodes.map((node) => {
      // TODO:nodes this will only grab the first p_dist_out value -- there is variation among the hits
      return node.queries[0].results.geojson.features[0].properties.p_dist_out
    })
    return labels.filter((l) => l != undefined)
  }

  const buildChart = (selectedFeatures) => {
    // https://www.chartjs.org/docs/latest/general/data-structures.html#parsing
    console.log('Building vis for selected features', selectedFeatures)
    const data = {
      labels: getLabels(selectedFeatures),
      datasets: getChartDatasets(selectedFeatures),
      title: getTitle()
    }
    updateChartData(data)
    return data
  }

  const buildDistanceChart = (nodes) => {
    console.log('Building chart for node-level swot data', nodes)
    const data = {
      labels: getNodeLabels(nodes),
      datasets: getNodeChartDatasets(nodes),
      title: getTitle()
    }
    console.log('Node Chart Data', data)
    nodeChartData.value = data
    hasNodeData.value = true
    return data
  }

  const setDatasetVisibility = (datasets, visible) => {
    datasets.forEach((dataset) => {
      dataset.hidden = !visible
    })
  }

  const filterDataQuality = (dataQualityFlags, datasets) => {
    console.log('Filtering data quality', dataQualityFlags)
    console.log('Starting Datasets', datasets)
    datasets.forEach((dataset) => {
      console.log('Starting pointstyle', dataset.pointStyle)
      const pointStyles = dataset.data.map((dataPoint, i) => {
        let pointStyle = dataset.pointStyle[i]
        if (!dataQualityFlags.includes(parseInt(m.reach_q))) {
          // TODO: need to figure out how to have the connecting line skip the point
          // https://www.chartjs.org/docs/latest/samples/line/segments.html
          pointStyle = false
        } else {
          const styles = getPointStyle(dataPoint)
          pointStyle = styles.pointStyle
        }
        return pointStyle
      })
      dataset.pointStyle = pointStyles
      console.log('Ending pointstyle', dataset.pointStyle)
    })
  }

  const filterDatasetsToTimeRange = (datasets, start, end, tolerance) => {
    // if end is null, use now
    if (end == null) {
      end = new Date()
    }
    if (start == null) {
      start = new Date(0)
    }
    if (start > end) {
      console.error('Invalid time range')
      return
    }
    if (tolerance == null) {
      tolerance = NODE_DATETIME_VARIATION
    }

    start = subMinutes(start, tolerance)
    end = addMinutes(end, tolerance)

    if (datasets == null) {
      console.log('Filtering using all datasets')
      datasets = nodeChartData.value.datasets
    }
    console.log('Filtering time range', start, end)
    console.log('Starting Datasets', datasets)

    datasets.forEach((dataset) => {
      // determine whether the dataset is within the time range
      // https://github.com/chartjs/Chart.js/issues/689
      if (dataset.minDateTime > end || dataset.maxDateTime < start) {
        dataset.hidden = true
      } else {
        dataset.hidden = false
      }
    })
    console.log('Ending Datasets', datasets)
  }

  const filterDatasetsBySetOfDates = (datasets, selectedTimeseriesPoints, tolerance) => {
    console.log('Filtering datasets by set of dates', datasets, selectedTimeseriesPoints)
    if (tolerance == null) {
      tolerance = NODE_DATETIME_VARIATION
    }
    if (selectedTimeseriesPoints == null) {
      console.error('No dateTimeGroups provided')
      return
    }
    if (datasets == null) {
      console.log('Filtering using all datasets')
      datasets = nodeChartData.value.datasets
    }
    console.log('Starting Datasets', datasets)

    datasets.forEach((dataset) => {
      // determine whether the dataset matches with the dateTimeGroups
      if (
        selectedTimeseriesPoints.some((timeSeriesPoint) => {
          const startCuttoff = subMinutes(timeSeriesPoint.datetime, tolerance)
          const endCuttoff = addMinutes(timeSeriesPoint.datetime, tolerance)
          if (dataset.minDateTime > endCuttoff || dataset.maxDateTime < startCuttoff) {
            return false
          }
          return true
        })
      ) {
        dataset.hidden = false
      } else {
        dataset.hidden = true
      }
    })
    console.log('Ending Datasets', datasets)
  }

  const getNodeTimeStamps = (measurements) => {
    // group the data by time range close enough to be considered the same
    // takes an array of measurements and returns an object of arrays of measurements
    // each array of measurements is considered to be the same time stamp
    // this is useful for plotting multiple datasets with the same time stamp

    // first sort all the data by timestamp
    measurements.sort((a, b) => {
      return new Date(a.datetime) - new Date(b.datetime)
    })

    const timeStampGroups = {}
    let currentGroup = []
    let lastTime = null
    measurements.forEach((m) => {
      const datetime = new Date(m.datetime)
      if (lastTime == null) {
        lastTime = datetime
      }
      if (Math.abs(datetime - lastTime) <= NODE_DATETIME_VARIATION * 60 * 1000) {
        currentGroup.push(m)
      } else {
        // save the current group and start a new one
        timeStampGroups[lastTime.getTime()] = currentGroup
        currentGroup = [m]
      }
      lastTime = datetime
    })
    timeStampGroups[lastTime.getTime()] = currentGroup

    // now sort each group by node_dist
    for (const date in timeStampGroups) {
      timeStampGroups[date].sort((a, b) => {
        return a.node_dist - b.node_dist
      })
    }
    return timeStampGroups
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
    console.log('getting node chart datasets for nodes', nodes)
    let measurements = nodes.map((node) => {
      console.log('Parsing node', node)
      return node.queries[0].results.geojson.features.map((feature) => {
        return feature.properties
      })
    })
    measurements = measurements.flat()
    measurements = filterMeasurements(measurements)
    console.log('Node measurements parsed', measurements)

    // instead of creating a single dataset, create a dataset for each timestamp
    const timeStampGroups = getNodeTimeStamps(measurements)
    console.log('Time Stamp Groups', timeStampGroups)

    // get the min and max dates and define a chroma scale
    const chartDates = getChartMinMaxDateTimes(timeStampGroups)
    const colorScale = chroma
      .scale(['yellow', 'red', 'black'])
      .domain([chartDates.minDateTime, chartDates.medianDateTime, chartDates.maxDateTime])

    console.log('using reach from ', nodes[0])
    const datasets = []
    for (const date in timeStampGroups) {
      const timeStampGroup = timeStampGroups[date]
      console.log('Time Stamp Group', timeStampGroup)
      datasets.push({
        label: timeStampGroup[0].datetime.toDateString(),
        data: timeStampGroup,
        parsing: {
          xAxisKey: 'p_dist_out',
          yAxisKey: 'wse'
        },
        ...getNodeDataSetStyle(timeStampGroup, colorScale),
        ...getDatasetMinMaxDateTimes(timeStampGroup)
      })
    }
    return datasets
  }

  const getDatasetMinMaxDateTimes = (timeStampGroup) => {
    // we actually expect very little or no variation in the time stamps
    // TODO: perhaps we can use the first and last time stamps to define the min and max
    const minDateTime = Math.min(...timeStampGroup.map((m) => m.datetime))
    const maxDateTime = Math.max(...timeStampGroup.map((m) => m.datetime))
    const medianDateTime = timeStampGroup[Math.floor(timeStampGroup.length / 2)].datetime.getTime()
    const dateStats = {
      minDateTime,
      maxDateTime,
      medianDateTime,
      hidden: false
    }
    return dateStats
  }

  const getChartMinMaxDateTimes = (timeStampGroups) => {
    console.log('Getting chart min max date times', timeStampGroups)
    const allMeasurements = Object.values(timeStampGroups).flat()
    const minDateTime = Math.min(...allMeasurements.map((m) => m.datetime))
    const maxDateTime = Math.max(...allMeasurements.map((m) => m.datetime))
    const medianDateTime =
      allMeasurements[Math.floor(allMeasurements.length / 2)].datetime.getTime()
    const dateStats = {
      minDateTime,
      maxDateTime,
      medianDateTime,
      hidden: false
    }
    console.log('Date Stats', dateStats)
    console.log('Time Stamp Groups', timeStampGroups)
    return dateStats
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

  const dateGradientColors = function (date, colorScale) {
    // https://www.chartjs.org/docs/latest/general/colors.html
    // https://github.com/kurkle/chartjs-plugin-gradient
    return colorScale(date)
  }

  const getPointStyle = (dataPoint) => {
    const dataQuality = dataPoint.reach_q ? dataPoint.reach_q : dataPoint.node_q
    let pointStyle = 'circle'
    let color = 'black'
    let fill = true
    let borderWidth = 1
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

    // handle static point selection
    if (dataPoint.selected) {
      borderWidth = 10
    }
    return {
      pointStyle,
      color,
      fill,
      borderWidth
    }
  }

  const getDataSetStyle = (dataSet) => {
    console.log('Getting data set style', dataSet)
    const styles = {
      colors: [],
      pointStyles: [],
      fills: []
    }
    dataSet.forEach((dataPoint) => {
      const { pointStyle, color, fill } = getPointStyle(dataPoint)
      styles.colors.push(color)
      styles.pointStyles.push(pointStyle)
      styles.fills.push(fill)
    })
    console.log('Styles', styles)
    return {
      showLine: false,
      pointStyle: styles.pointStyles,
      pointRadius: 5,
      pointHoverRadius: 15,
      fill: styles.fills,
      color: styles.colors,
      borderColor: styles.colors,
      backgroundColor: 'rgb(75, 192, 192)',
      borderWidth: getBorderWidth
    }
  }

  function getBorderWidth(context) {
    // if the data point is selected, make the border width larger
    const index = context.dataIndex
    if (index == null) {
      return 1
    }
    const dataPoint = context.dataset.data[index]
    if (dataPoint.selected) {
      return 10
    }
    return 1
  }

  const getNodeDataSetStyle = (dataSet, colorScale) => {
    console.log('Getting node data set style', dataSet)
    const styles = {
      pointColors: [],
      pointStyles: [],
      dynamicColors: []
    }
    dataSet.forEach((dataPoint) => {
      const { pointStyle, color } = getPointStyle(dataPoint.node_q)
      styles.pointColors.push(color)
      styles.pointStyles.push(pointStyle)
      styles.dynamicColors.push(dateGradientColors(dataPoint.datetime, colorScale))
    })
    console.log('Styles', styles)
    return {
      showLine: true,
      pointStyle: styles.pointStyles,
      pointRadius: 5,
      pointHoverRadius: 15,
      fill: styles.dynamicColors,
      // color: styles.colors,
      borderColor: styles.dynamicColors, // The line fill color.
      backgroundColor: styles.dynamicColors, // The line color.
      spanGaps: false,
      pointBackgroundColor: styles.pointColors,
      pointBorderColor: styles.pointColors
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
    filterDataQuality,
    filterDatasetsToTimeRange,
    filterDatasetsBySetOfDates,
    setDatasetVisibility,
    getNodeTimeStamps,
    chartTab
  }
})
