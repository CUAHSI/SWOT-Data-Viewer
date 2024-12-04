import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { NODE_DATETIME_VARIATION } from '@/constants'
import { addMinutes, subMinutes } from 'date-fns'
import chroma from 'chroma-js'
import { mdiCircle, mdiSquareRounded, mdiRectangle, mdiRhombus } from '@mdi/js'
import { useHydrologicStore } from '@/stores/hydrologic'



export const useChartsStore = defineStore('charts', () => {
  const unfilteredChartData = ref({})
  const unfilteredNodeChartData = ref({})
  const chartData = ref({})
  const nodeChartData = ref({})
  const storedCharts = ref([])
  const hasNodeData = ref(false)
  const chartTab = ref('timeseries')
  const showStatistics = ref(false)
  const showLine = ref(true)
  const dataQualityFlags = ref([0, 1])  // by default don't show degraded or bad data
  let colorScale = chroma.scale('YlGnBu').mode('lch').colors(3)

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

  const generateDataQualityLegend = () => {
    return dataQualityOptions.map((option) => ({
      text: option.label,
      fillStyle: option.pointBorderColor,
      strokeStyle: option.pointBorderColor,
      pointStyle: option.pointStyle,
      strokeStyle: 'black',
      lineWidth: 2,
    }));
  };

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

  const activePlt = ref(nodeCharts.value[0])

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
    // https://github.com/apertureless/vue-chartjs/issues/1040
    unfilteredChartData.value = data
    dataQualityFilterAllDatasets()
    return data
  }

  const buildDistanceChart = (nodes) => {
    console.log('Building chart for node-level swot data', nodes)
    const data = {
      labels: getNodeLabels(nodes),
      datasets: getNodeChartDatasets(nodes),
      title: getTitle()
    }
    // https://github.com/apertureless/vue-chartjs/issues/1040
    unfilteredNodeChartData.value = data
    dataQualityFilterAllDatasets()
    hasNodeData.value = true
    return data
  }

  const setDatasetVisibility = (datasets, visible) => {
    datasets.forEach((dataset) => {
      dataset.hidden = !visible
    })
  }

  /**
   * Filters the data quality for all datasets.
   *
   * This function processes the chart data and node chart data by applying data quality filters.
   * It first makes a copy of the unfiltered data, then filters the datasets to only include SWOT series,
   * which are the only series that have a quality flag. It then loops over each point in the SWOT datasets
   * and updates the point style based on the data quality filters.
   *
   * The function assumes that `chartData`, `nodeChartData`, `unfilteredChartData`, and `unfilteredNodeChartData`
   * are reactive objects (e.g., Vue's `ref` or `reactive`).
   *
   * Note:
   * - `chartData` and `nodeChartData` hold the filtered data.
   * - `unfilteredChartData` and `unfilteredNodeChartData` hold the unfiltered data.
   *
   * @returns {void}
   */
  const dataQualityFilterAllDatasets = () => {
    // make a copy of the unfiltered data
    chartData.value = JSON.parse(JSON.stringify(unfilteredChartData.value))
    nodeChartData.value = JSON.parse(JSON.stringify(unfilteredNodeChartData.value))

    for (const data of [chartData.value, nodeChartData.value]) {
      const datasets = data?.datasets
      if (datasets == null) {
        console.warn('No datasets found when filtering data quality')
        continue
      }
      // loop over each point in the swot datasets and update the point style
      datasets.forEach((dataset) => {
        dataQualityFilterSingleDataset(dataset)
        // update the line visibility
        dataset.showLine = showLine.value
      })
    }
  }

  const dataQualityFilterSingleDataset = (dataset) => {
    // Filter the dataset to only include points that have a data quality flag

    if(!['swot_node_series', 'swot_reach_series'].includes(dataset.seriesType)) {
      return
    }

    dataset.data = dataset.data.filter((dataPoint) => {
      const qualityLabel = dataPoint.reach_q ? 'reach_q' : 'node_q'
      if (!dataQualityFlags.value.includes(parseInt(dataPoint[qualityLabel]))) {
        return false
      }
      return true
    })
    dataset.pointStyle = getPointStyles(dataset)
    dataset.pointBorderColor = getPointBorderColors(dataset)
  }

  const filterDatasetsToTimeRange = (datasets, start, end, tolerance) => {
    // if end is null, use now
    const featureStore = useFeaturesStore()
    const { timeRange } = storeToRefs(featureStore)
    if (end == null) {
      end = new Date(timeRange.value[1] * 1000)
    }
    if (start == null) {
      start = new Date(timeRange.value[0] * 1000)

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
    updateAllCharts()
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

  const removeInvalidMeasurements = (measurements) => {
    // TODO: this is a hack to remove the invalid measurements
    // need to handle this with a formal validator
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
      return true
    })
    return measurements
  }

  const getChartDatasets = (selectedFeatures) => {
    // builds the datasets for the time series chart. These are labeled
    // using seriesType='swot_reach_series' to differentiate them from
    // node-level data.

    const featureStore = useFeaturesStore()
    // TODO: need to update just for the newly selected feature: this currently will re-map all selected features
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

      measurements = removeInvalidMeasurements(measurements)
      return {
        // TODO: nodes label assumes reach
        label: `${featureStore.getFeatureName(feature)} | ${feature?.feature_id}`,
        data: measurements,
        seriesType: 'swot_reach_series',
        ...getDataSetStyle(),
        pointRadius: 6,
      }
    })
  }

  /**
   * Updates the color scale based on the time range from the feature store.
   * 
   * This function retrieves the time range from the feature store, calculates
   * the minimum, median, and maximum date times, and then creates a new color
   * scale using the chroma library.
   * 
   * @function
   * @returns {void}
   */
  const updateColorScale = () => {
    const featureStore = useFeaturesStore()
    const { timeRange } = storeToRefs(featureStore)
    const chartDates = {
      minDateTime: new Date(timeRange.value[0] * 1000),
      medianDateTime: new Date(timeRange.value[0] * 1000 + (timeRange.value[1] - timeRange.value[0]) * 1000 / 2),
      maxDateTime: new Date(timeRange.value[1] * 1000),
    }
    const newColorScale = chroma
      .scale('YlGnBu').mode('lch')
      .domain([chartDates.minDateTime, chartDates.medianDateTime, chartDates.maxDateTime])
    colorScale = newColorScale
  }

  const getNodeChartDatasets = (nodes) => {
    // builds the datasets for the long-profile chart. These are labeled
    // using seriesType='swot_node_series' to differentiate them from
    // reach-level data.
    let measurements = nodes.map((node) => {
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
    measurements = removeInvalidMeasurements(measurements)

    // instead of creating a single dataset, create a dataset for each timestamp
    const timeStampGroups = getNodeTimeStamps(measurements)

    const datasets = []
    for (const date in timeStampGroups) {
      const timeStampGroup = timeStampGroups[date]
      datasets.push({
        label: timeStampGroup[0].datetime.toDateString(),
        data: timeStampGroup,
        seriesType: 'swot_node_series',
        ...getNodeDataSetStyle(timeStampGroup),
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
    return dateStats
  }

  const dynamicColors = function () {
    var r = Math.floor(Math.random() * 255)
    var g = Math.floor(Math.random() * 255)
    var b = Math.floor(Math.random() * 255)
    return 'rgb(' + r + ',' + g + ',' + b + ')'
  }

  const dateGradientColors = function (date) {
    // https://www.chartjs.org/docs/latest/general/colors.html
    // https://github.com/kurkle/chartjs-plugin-gradient

    // check if the date is a Date object, if not, convert it
    if (!(date instanceof Date)) {
      date = new Date(date)
    }
    return colorScale(date).hex()
  }

  const getDateGradientColors = (dataSet) => {
    updateColorScale()
    if (dataSet.length == 0) {
      return []
    }
    const firstColor = dateGradientColors(dataSet[0].datetime)
    // fill an arry with the same color for each data point
    return Array(dataSet.length).fill(firstColor)
  }

  const getPointBorderColors = (dataSet) => {
    if(!['swot_node_series', 'swot_reach_series'].includes(dataSet.seriesType)) {
      return dataSet.pointBorderColor
    }
    const pointBorderColors = []
    dataSet.data.forEach((dataPoint) => {
      const pointBorderColor = getPointBorderColor(dataPoint)
      pointBorderColors.push(pointBorderColor)
    })
    return pointBorderColors
  }

  const getPointStyles = (dataSet) => {
    if(!['swot_node_series', 'swot_reach_series'].includes(dataSet.seriesType)) {
      return dataSet.pointStyle
    }
    const pointStyles = []
    dataSet.data.forEach((dataPoint) => {
      const pointStyle = getPointStyle(dataPoint)
      pointStyles.push(pointStyle)
    })
    return pointStyles
  }

  const getPointStyle = (dataPoint) => {
    const qualityLabel = dataPoint.reach_q ? 'reach_q' : 'node_q'
    if (!dataQualityFlags.value.includes(parseInt(dataPoint[qualityLabel]))) {
      return false
    }
    
    // https://www.chartjs.org/docs/latest/configuration/elements.html#point-configuration
    const dataQuality = dataPoint.reach_q ? dataPoint.reach_q : dataPoint.node_q
    let pointStyle = 'circle'
    // Values of 0, 1, 2, and 3 indicate good, suspect, degraded, and bad measurements, respectively
    const dataQualityOption = dataQualityOptions.find((option) => option.value == dataQuality)
    if (dataQualityOption) {
      pointStyle = dataQualityOption.pointStyle
    }
    return pointStyle
  }

  const getPointBorderColor = (dataPoint) => {
    const qualityLabel = dataPoint.reach_q ? 'reach_q' : 'node_q'
    if (!dataQualityFlags.value.includes(parseInt(dataPoint[qualityLabel]))) {
      return false
    }
    
    // https://www.chartjs.org/docs/latest/configuration/elements.html#point-configuration
    const dataQuality = dataPoint.reach_q ? dataPoint.reach_q : dataPoint.node_q
    let pointBorderColor = 'white'
    // Values of 0, 1, 2, and 3 indicate good, suspect, degraded, and bad measurements, respectively
    const dataQualityOption = dataQualityOptions.find((option) => option.value == dataQuality)
    if (dataQualityOption) {
      pointBorderColor = dataQualityOption.pointBorderColor
    }
    return pointBorderColor
  }

  const getDataSetStyle = () => {
    const style = {
      showLine: showLine.value,
      fill: true,
      pointBorderColor: ctx => getPointBorderColors(ctx.dataset),
      pointStyle: ctx => getPointStyles(ctx.dataset),
      pointBorderWidth: 2,
      borderColor: 'black', // The line fill color.
      backgroundColor: 'black', // The line color
      pointHoverRadius: 15,
      pointHoverBorderWidth: 5,
      pointRadius: getPointRadius,
      borderWidth: getBorderWidth,
    }
    return style
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
    return 8
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

  const getNodeDataSetStyle = (dataSet) => {
    const colors = getDateGradientColors(dataSet)
    return {
      showLine: showLine.value,
      pointRadius: 5,
      pointHoverRadius: 15,
      //fill: styles.dynamicColors,
      fill: false,
      // color: styles.colors,
      // borderWidth: 1,
      backgroundColor: colors,
      pointBorderColor: ctx => getPointBorderColors(ctx.dataset),
      pointStyle: ctx => getPointStyles(ctx.dataset),
      // borderColor: styles.dynamicColors, // The line fill color.
      borderColor: colors,
      pointBorderWidth: 1,
      pointHoverBorderWidth: 5,
    }
  }

  const updateNodeDataSetStyles = () => {
    nodeChartData.value.datasets.forEach((dataset) => {
      // replace the dataset properties with those from getNodeDataSetStyle
      const updatedStyles = getNodeDataSetStyle(dataset.data)
      for (const key in updatedStyles) {
        dataset[key] = updatedStyles[key]
      }
    })
  }

  const updateShowLine = () => {
    // iterate over stored charts and update the line visibility
    storedCharts.value.forEach((storedChart) => {
      try {
        storedChart.chart.data.datasets.filter(ds => ds.seriesType != 'computed_series').forEach((dataset) => {
          dataset.showLine = showLine.value
        })
        storedChart.chart.update()
      } catch (error) {
        console.error('Error updating chart lines', error)
      }
    })
  }

  const updateAllCharts = () => {
    updateNodeDataSetStyles()
    // iterate over stored charts and update the line visibility
    storedCharts.value.forEach((storedChart) => {
      try {
        storedChart.chart.update()
      } catch (error) {
        console.error('Error updating chart', error)
      }
    })
  }

  const storeMountedChart = (chart) => {
    storedCharts.value.push(chart)

    // clean stored charts that are undifined
    cleanStoredCharts()

  }

  const cleanStoredCharts = () => {
    storedCharts.value = storedCharts.value.filter(e => e.chart != undefined) ;

  }


  return {
    updateNodeChartData,
    chartData,
    nodeChartData,
    clearChartData,
    buildChart,
    buildDistanceChart,
    hasNodeData,
    dynamicColors,
    dataQualityFilterAllDatasets,
    updateAllCharts,
    filterDatasetsToTimeRange,
    filterDatasetsBySetOfDates,
    dataQualityOptions,
    dataQualityFlags,
    setDatasetVisibility,
    getNodeTimeStamps,
    chartTab,
    nodeCharts,
    reachCharts,
    showStatistics,
    showLine,
    updateShowLine,
    storeMountedChart,
    activePlt,
    generateDataQualityLegend
  }
})
