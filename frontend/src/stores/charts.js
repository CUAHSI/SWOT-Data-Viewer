import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { NODE_DATETIME_VARIATION } from '@/constants'
import { addMinutes, subMinutes } from 'date-fns'
import chroma from 'chroma-js'
import { mdiCircle, mdiSquareRounded, mdiRectangle, mdiRhombus } from '@mdi/js'
import { useHydrologicStore } from '@/stores/hydrologic'



export const useChartsStore = defineStore('charts', () => {
  let chartData = ref({})
  let nodeChartData = ref({})
  const storedCharts = ref([])
  const showChart = ref(false)
  const hasNodeData = ref(false)
  const chartTab = ref('timeseries')
  const plotStyle = ref('Scatter')
  const showStatistics = ref(false)
  const showLine = ref(false)

  const dataQualityOptions = [
    { value: 0, label: 'good', pointStyle: 'circle', pointBorderColor: 'white', icon: mdiCircle },
    {
      value: 1,
      label: 'suspect',
      pointStyle: 'rectRounded',
      pointBorderColor: 'yellow',
      icon: mdiSquareRounded
    },
    {
      value: 2,
      label: 'degraded',
      pointStyle: 'rect',
      pointBorderColor: 'orange',
      icon: mdiRectangle
    },
    { value: 3, label: 'bad', pointStyle: 'rectRot', pointBorderColor: 'red', icon: mdiRhombus }
  ]

  // load the swot variables from the hydrologic store.
  // these are used to build the charts for the node and reach views.
  const hydrologicStore = useHydrologicStore()
  let swotVariables = ref(hydrologicStore.swotVariables)

  // a collection of charts that can be created in the node view
  const nodeCharts = ref([
    {
      abbreviation: 'wse/dist',
      xvar: swotVariables.value.find((v) => v.abbreviation == 'p_dist_out'),
      yvar: swotVariables.value.find((v) => v.abbreviation == 'wse'),
      title: 'Water Surface Elevation along Reach Length',
      name: 'WSE vs Distance',
      help: swotVariables.value.find((v) => v.abbreviation == 'wse').definition,
    },
    {
      abbreviation: 'area/dist',
      xvar: swotVariables.value.find((v) => v.abbreviation == 'p_dist_out'),
      yvar: swotVariables.value.find((v) => v.abbreviation == 'area_total'),
      title: 'Water Surface Area along Reach Length',
      help: swotVariables.value.find((v) => v.abbreviation == 'area_total').definition,
      name: 'WSA vs Distance',
    },
    {
      abbreviation: 'width/dist',
      xvar: swotVariables.value.find((v) => v.abbreviation == 'p_dist_out'),
      yvar: swotVariables.value.find((v) => v.abbreviation == 'width'),
      title: 'Reach Width along Reach Length',
      help: "Reach Width plotted against Reach Length for all nodes in the selected reach",
      name: 'Width vs Distance',
    },
    {
      abbreviation: 'wse/width',
      xvar: swotVariables.value.find((v) => v.abbreviation == 'width'),
      yvar: swotVariables.value.find((v) => v.abbreviation == 'wse'),
      title: 'Water Surface Elevation vs Reach Width',
      help: "Water Surface Elevation plotted against Reach Width for all nodes in the selected reach",
      name: 'WSE vs Width',
    }
  ])

  // a collection of charts that can be created in the reach view
  const reachCharts = ref([
    {
      abbreviation: 'wse/time',
      xvar: swotVariables.value.find((v) => v.abbreviation == 'time_str'),
      yvar: swotVariables.value.find((v) => v.abbreviation == 'wse'),
      title: 'Water Surface Elevation',
      name: 'WSE vs Time',
      help: swotVariables.value.find((v) => v.abbreviation == 'wse').definition,
    },
    {
      abbreviation: 'area/time',
      xvar: swotVariables.value.find((v) => v.abbreviation == 'time_str'),
      yvar: swotVariables.value.find((v) => v.abbreviation == 'area_total'),
      title: 'Water Surface Area',
      help: swotVariables.value.find((v) => v.abbreviation == 'area_total').definition,
      name: 'WSA vs Time',
    },
    {
      abbreviation: 'width/time',
      xvar: swotVariables.value.find((v) => v.abbreviation == 'time_str'),
      yvar: swotVariables.value.find((v) => v.abbreviation == 'width'),
      title: 'Reach Width',
      help: "Reach Width plotted against Reach Length for all nodes in the selected reach",
      name: 'Width vs Time',
    },
    {
      abbreviation: 'slope/time',
      xvar: swotVariables.value.find((v) => v.abbreviation == 'time_str'),
      yvar: swotVariables.value.find((v) => v.abbreviation == 'slope'),
      title: 'Reach Slope',
      help: swotVariables.value.find((v) => v.abbreviation == 'slope').definition,
      name: 'Slope vs Time',
    }
  ])

  const updateChartData = (data) => {
    // TODO: bug in reactivity
    // https://github.com/apertureless/vue-chartjs/issues/1040
    chartData.value = data
    console.log('Updated chart data', chartData.value)
  }

  const updateNodeChartData = (data) => {
    // This function is used to update the nodeChartData object
    // data = the new data series to set in the object.
    nodeChartData.value.datasets = data
    console.log('Updated Node Chart Data', nodeChartData.value)
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
    // when compact = true, there will only be a single feature
    const propertyObject = selectedFeatures[0].queries[0].results.geojson.features[0].properties
    const labels = propertyObject.time_str.map((time_str) => {
      if (time_str == 'no_data') {
        return
      }
      return time_str
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

  const filterDataQuality = (dataQualityFlags, datasets, qualityLabel = 'reach_q') => {
    // Alters series point styles between their default style (dataset.pointStyle) and
    // Null. This is used to toggle them on/off using the data quality flag selection
    // from the DataQuality.vue component.

    // filter datasets to only include SWOT series. These are the
    // only series that have a quality flag
    let swotDatasets = datasets.filter((d) =>
      ['swot_node_series', 'swot_reach_series'].includes(d.seriesType)
    )

    // loop over each point in the swot datasets and update the point style
    swotDatasets.forEach((dataset) => {
      const pointStyles = dataset.data.map((dataPoint, i) => {
        let pointStyle = dataset.pointStyle[i]

        if (!dataQualityFlags.includes(parseInt(dataPoint[qualityLabel]))) {
          // TODO: CAM-393
          // need to figure out how to have the connecting line skip the point
          // https://www.chartjs.org/docs/latest/samples/line/segments.html
          pointStyle = false
        } else {
          const styles = getPointStyle(dataPoint)
          pointStyle = styles.pointStyle
        }
        return pointStyle
      })

      dataset.pointStyle = pointStyles
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

    // Buffer start and end times by the tolerance
    // Convert into a Date object and save as epoch time
    // for comparision later.
    start = subMinutes(start, tolerance)
    end = addMinutes(end, tolerance)
    console.log('Filtering time range', start, end)

    if (datasets == null) {
      console.log('Filtering using all datasets')
      datasets = nodeChartData.value.datasets
    }

    datasets.forEach((dataset) => {
      // determine whether the dataset is within the time range
      // https://github.com/chartjs/Chart.js/issues/689
      if (dataset.minDateTime > end || dataset.maxDateTime < start) {
        dataset.hidden = true
      } else {
        dataset.hidden = false
      }
    })
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
    // builds the datasets for the time series chart. These are labeled
    // using seriesType='swot_reach_series' to differentiate them from
    // node-level data.

    const featureStore = useFeaturesStore()
    // TODO: need to update just for the newly selected feature: this currently will re-map all selected features
    console.log('Getting chart datasets for selected features', selectedFeatures)
    return selectedFeatures.map((feature) => {
      // TODO: for now we just use the first query
      // with compact = true, there will only be a single feature and properties is an object of arrays
      let propertyObject = feature.queries[0].results.geojson.features[0].properties

      // each property of the propertyObject contains an array of measurements.
      // the key in the propertyObject is the variable abbreviation
      // we need to convert this to a single array of objects
      // https://www.chartjs.org/docs/latest/general/data-structures.html#object
      let measurements = []
      for (const key in propertyObject) {
        let values = propertyObject[key]
        values.forEach((value, i) => {
          if (measurements[i] == null) {
            measurements[i] = {}
          }
          measurements[i][key] = value
        })
      }

      measurements = filterMeasurements(measurements, dataQualityFlags)
      console.log('SWOT measurements', measurements)
      console.log('SWOT feature', feature)
      return {
        // TODO: nodes label assumes reach
        label: `${featureStore.getFeatureName(feature)} | ${feature?.feature_id}`,
        data: measurements,
        seriesType: 'swot_reach_series',
        ...getDataSetStyle(measurements)
      }
    })
  }

  const getNodeChartDatasets = (nodes) => {
    // builds the datasets for the long-profile chart. These are labeled
    // using seriesType='swot_node_series' to differentiate them from
    // reach-level data.
    console.log('getting node chart datasets for nodes', nodes)
    let measurements = nodes.map((node) => {
      console.log('Parsing node', node)
      const propertiesObj =  node.queries[0].results.geojson.features[0].properties
      let array = []
      for (const key in propertiesObj) {
        let values = propertiesObj[key]
        values.forEach((value, i) => {
          if (array[i] == null) {
            array[i] = {}
          }
          array[i][key] = value
        })
      }
      return array
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
      .scale(['blue', 'purple', 'black'])
      .mode('lch')
      .domain([chartDates.minDateTime, chartDates.medianDateTime, chartDates.maxDateTime])

    console.log('using reach from ', nodes[0])
    const datasets = []
    for (const date in timeStampGroups) {
      const timeStampGroup = timeStampGroups[date]
      console.log('Time Stamp Group', timeStampGroup)
      datasets.push({
        label: timeStampGroup[0].datetime.toDateString(),
        data: timeStampGroup,
        seriesType: 'swot_node_series',
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
    // https://www.chartjs.org/docs/latest/configuration/elements.html#point-configuration
    const dataQuality = dataPoint.reach_q ? dataPoint.reach_q : dataPoint.node_q
    let pointStyle = 'circle'
    let pointBorderColor = 'white'
    // Values of 0, 1, 2, and 3 indicate good, suspect, degraded, and bad measurements, respectively
    const dataQualityOption = dataQualityOptions.find((option) => option.value == dataQuality)
    if (dataQualityOption) {
      pointStyle = dataQualityOption.pointStyle
      pointBorderColor = dataQualityOption.pointBorderColor
    }
    return {
      pointStyle,
      pointBorderColor
    }
  }

  const getDataSetStyle = (dataSet) => {
    console.log('Getting data set style', dataSet)
    const styles = {
      colors: [],
      pointStyles: [],
      fills: [],
      pointBorderColors: []
    }
    dataSet.forEach((dataPoint) => {
      const { pointStyle, pointBorderColor } = getPointStyle(dataPoint)
      styles.pointBorderColors.push(pointBorderColor)
      styles.pointStyles.push(pointStyle)
    })
    console.log('Styles', styles)
    return {
      showLine: showLine.value,
      pointStyle: styles.pointStyles,
      fill: true,
      pointBorderColor: styles.pointBorderColors,
      pointBorderWidth: 2,
      borderColor: 'black', // The line fill color.
      backgroundColor: 'black', // The line color
      pointHoverRadius: 15,
      pointHoverBorderWidth: 5,
      pointRadius: getPointRadius,
      borderWidth: getBorderWidth
    }
  }

  function getPointRadius(context) {
    // if the data point is selected, increase the radius
    const index = context.dataIndex
    if (index == null) {
      return 1
    }
    const dataPoint = context.dataset.data[index]
    if (dataPoint.selected) {
      return 10
    }
    return 5
  }

  function getBorderWidth(context) {
    // if the data point is selected, make the border width larger
    const index = context.dataIndex
    if (index == null) {
      return 1
    }
    const dataPoint = context.dataset.data[index]
    if (dataPoint.selected) {
      return 5
    }
    return 1
  }

  const getNodeDataSetStyle = (dataSet, colorScale) => {
    console.log('Getting node data set style', dataSet)
    const styles = {
      pointBorderColor: [],
      pointStyles: [],
      dynamicColors: []
    }
    dataSet.forEach((dataPoint) => {
      const { pointStyle, pointBorderColor } = getPointStyle(dataPoint)
      styles.pointBorderColor.push(pointBorderColor)
      styles.pointStyles.push(pointStyle)
      styles.dynamicColors.push(dateGradientColors(dataPoint.datetime, colorScale))
    })
    console.log('Styles', styles)
    return {
      showLine: showLine.value,
      pointStyle: styles.pointStyles,
      pointRadius: 5,
      pointHoverRadius: 15,
      //fill: styles.dynamicColors,
      fill: false,
      // color: styles.colors,
      borderColor: styles.dynamicColors, // The line fill color.
      backgroundColor: styles.dynamicColors, // The line color.
      spanGaps: false,
      pointBackgroundColor: styles.pointColors,
      pointBorderColor: styles.pointBorderColor,
      // borderWidth: 1,
      pointBorderWidth: 1,
      pointHoverBorderWidth: 5
    }
  }

  const updateShowLine = () => {
    // iterate over stored charts and update the line visibility
    storedCharts.value.forEach((storedChart) => {
      try {
        storedChart.chart.data.datasets.forEach((dataset) => {
          dataset.showLine = showLine.value
        })
        storedChart.chart.update()
      } catch (error) {
        console.error('Error updating chart lines', error)
      }
    })
  }

  const storeMountedChart = (chart) => {
    storedCharts.value.push(chart)
  }

  return {
    updateChartData,
    updateNodeChartData,
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
    dataQualityOptions,
    setDatasetVisibility,
    getNodeTimeStamps,
    chartTab,
    nodeCharts,
    reachCharts,
    plotStyle,
    updateChartLine,
    lineChart,
    nodeChart,
    showStatistics
    showLine,
    updateShowLine,
    storeMountedChart
  }
})
