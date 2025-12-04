import { defineStore, storeToRefs } from 'pinia'
import { nextTick, ref, watch, shallowRef } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { NODE_DATETIME_VARIATION } from '@/constants'
import { addMinutes, subMinutes } from 'date-fns'
import chroma from 'chroma-js'
import { mdiCircle, mdiSquareRounded, mdiRectangle, mdiRhombus } from '@mdi/js'
import { useHydrologicStore } from '@/stores/hydrologic'
import { useAlertStore } from '@/stores/alerts'
import { useRouter } from 'vue-router'

export const useChartsStore = defineStore(
  'charts',
  () => {
    const unfilteredChartData = ref({})
    const unfilteredNodeChartData = ref({})
    const chartData = ref({})
    const nodeChartData = ref({})
    const storedCharts = ref([])
    const activeNodeChart = ref(null)
    const activeReachChart = ref(null)
    const hasNodeData = ref(false)
    const chartTab = ref('timeseries')
    const showStatistics = ref(false)
    const symbology = ref(['Lines', 'Markers'])
    const dataQualityFlags = ref([0, 1, 2]) // by default don't show bad data
    const colorScale = shallowRef({})
    const router = useRouter()
    const selectedTimeseriesPoints = ref([])

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

    const generateDataQualityLegend = (chartType = 'line') => {
      return dataQualityOptions.map((option) => ({
        text: option.label,
        fillStyle: 'black',
        strokeStyle: option.pointBorderColor,
        pointStyle: option.pointStyle,
        lineWidth: chartType === 'line' ? 5 : 3,
        pointBorderWidth: chartType === 'line' ? 5 : 3
      }))
    }

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
        help: swotVariables.value.find((v) => v.abbreviation == 'wse').definition
      },
      {
        abbreviation: 'area/dist',
        xvar: swotVariables.value.find((v) => v.abbreviation == 'p_dist_out'),
        yvar: swotVariables.value.find((v) => v.abbreviation == 'area_total'),
        title: 'Water Surface Area along Reach Length',
        help: swotVariables.value.find((v) => v.abbreviation == 'area_total').definition,
        name: 'WSA vs Distance'
      },
      {
        abbreviation: 'width/dist',
        xvar: swotVariables.value.find((v) => v.abbreviation == 'p_dist_out'),
        yvar: swotVariables.value.find((v) => v.abbreviation == 'width'),
        title: 'Reach Width along Reach Length',
        help: 'Reach Width plotted against Reach Length for all nodes in the selected reach',
        name: 'Width vs Distance'
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
        help: swotVariables.value.find((v) => v.abbreviation == 'wse').definition
      },
      {
        abbreviation: 'area/time',
        xvar: swotVariables.value.find((v) => v.abbreviation == 'time_str'),
        yvar: swotVariables.value.find((v) => v.abbreviation == 'area_total'),
        title: 'Water Surface Area',
        help: swotVariables.value.find((v) => v.abbreviation == 'area_total').definition,
        name: 'WSA vs Time'
      },
      {
        abbreviation: 'width/time',
        xvar: swotVariables.value.find((v) => v.abbreviation == 'time_str'),
        yvar: swotVariables.value.find((v) => v.abbreviation == 'width'),
        title: 'Reach Width',
        help: 'Reach Width plotted against Reach Length for all nodes in the selected reach',
        name: 'Width vs Time'
      },
      {
        abbreviation: 'slope/time',
        xvar: swotVariables.value.find((v) => v.abbreviation == 'time_str'),
        yvar: swotVariables.value.find((v) => v.abbreviation == 'slope'),
        title: 'Reach Slope',
        help: swotVariables.value.find((v) => v.abbreviation == 'slope').definition,
        name: 'Slope vs Time'
      }
    ])

    // a collection of charts that can be created in the lake view
    const lakeCharts = ref([
      {
        abbreviation: 'wse/time',
        xvar: swotVariables.value.find((v) => v.abbreviation == 'time_str'),
        yvar: swotVariables.value.find((v) => v.abbreviation == 'wse'),
        title: 'Water Surface Elevation',
        name: 'WSE vs Time',
        help: swotVariables.value.find((v) => v.abbreviation == 'wse').definition
      },
      {
        abbreviation: 'area/time',
        xvar: swotVariables.value.find((v) => v.abbreviation == 'time_str'),
        yvar: swotVariables.value.find((v) => v.abbreviation == 'area_total'),
        title: 'Water Surface Area',
        help: swotVariables.value.find((v) => v.abbreviation == 'area_total').definition,
        name: 'WSA vs Time'
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

    const symbologyContains = (value) => {
      // check if symbology.value is an array
      if (Array.isArray(symbology.value)) {
        return symbology.value.includes(value)
      }
      return false
    }

    const getLabels = (selectedFeatures) => {
      // TODO: for now we just use the first query
      // when compact = true, there will only be a single feature
      try {
        const propertyObject = selectedFeatures[0].queries[0].results.geojson.features[0].properties
        const labels = propertyObject.time_str.map((time_str) => {
          if (time_str == 'no_data') {
            return
          }
          return time_str
        })
        return labels.filter((l) => l != undefined)
      } catch (error) {
        console.error('Error getting labels', error)
      }
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
      filterDatasetsToTimeRange()
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
      filterDatasetsToTimeRange()
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
          const alertStore = useAlertStore()
          alertStore.displayAlert({
            title: 'No Data to Display',
            text: 'No data available with the selected data quality filters. Please select a broader time range or different filters.',
            type: 'warning',
            closable: true,
            duration: 6
          })
          continue
        }
        // loop over each point in the swot datasets and update the point style
        datasets.forEach((dataset) => {
          dataQualityFilterSingleDataset(dataset)
          // update the line visibility
          dataset.showLine = symbologyContains('Lines')
          // https://www.chartjs.org/docs/latest/charts/line.html#dataset-properties
          // storedChart.chart.options.elements.point.pointstyle = false
        })
      }
    }

    const determineQualityLabel = (dataPoint) => {
      // Support reach_q, node_q, or quality_f as the quality label
      let qualityLabel = null
      if ('quality_f' in dataPoint) {
        qualityLabel = 'quality_f'
      } else if ('reach_q' in dataPoint) {
        qualityLabel = 'reach_q'
      } else if ('node_q' in dataPoint) {
        qualityLabel = 'node_q'
      }
      return qualityLabel
    }

    const dataQualityFilterSingleDataset = (dataset) => {
      // Filter the dataset to only include points that have a data quality flag

      if (!['swot_node_series', 'swot_reach_series'].includes(dataset.seriesType)) {
        return
      }

      dataset.data = dataset.data.filter((dataPoint) => {
        let qualityLabel = determineQualityLabel(dataPoint)
        if (!qualityLabel) {
          return true // If no quality label, keep the point
        }
        if (!dataQualityFlags.value.includes(parseInt(dataPoint[qualityLabel]))) {
          return false
        }
        return true
      })
      dataset.pointStyle = getPointStyles(dataset)
      dataset.pointBorderColor = getPointBorderColors(dataset)
    }

    const filterDatasetsToTimeRange = async (start, end, tolerance) => {
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

      // make a copy of the unfiltered reach data
      chartData.value = JSON.parse(JSON.stringify(unfilteredChartData.value))
      // because we copied the data,
      // need to apply the data quality filter before filtering the time range
      dataQualityFilterAllDatasets()

      const reachDataSets = chartData.value.datasets
      if (reachDataSets) {
        reachDataSets.forEach((dataset) => {
          if (dataset.seriesType !== 'swot_reach_series') {
            return
          }
          // reach points are all in a single dataset
          // we need to filter the points individually
          dataset.data = dataset.data.filter((dataPoint) => {
            const datetime = new Date(dataPoint.time_str)
            if (datetime < start || datetime > end) {
              return false
            }
            return true
          })
          // calculate a new min/max date time for the dataset
          dataset.minDateTime = Math.min(
            ...dataset.data.map((m) => {
              return new Date(m.datetime)
            })
          )
          dataset.maxDateTime = Math.max(
            ...dataset.data.map((m) => {
              return new Date(m.datetime)
            })
          )
          dataset.pointStyle = getPointStyles(dataset)
          dataset.pointBorderColor = getPointBorderColors(dataset)
        })
      }
      // update the chartData.value.labels to match the new time range
      chartData.value.labels = chartData.value.datasets[0].data.map((dataPoint) => {
        return dataPoint.time_str
      })

      const nodeDataSets = nodeChartData.value.datasets
      if (nodeDataSets) {
        nodeDataSets.forEach((dataset) => {
          if (dataset.seriesType !== 'swot_node_series') {
            return
          }
          // determine whether the dataset is within the time range
          // https://github.com/chartjs/Chart.js/issues/689
          if (dataset.minDateTime > end || dataset.maxDateTime < start) {
            dataset.hidden = true
          } else {
            dataset.hidden = false
          }
        })
      }
      await nextTick()
      updateNodeDataSetStyles()
      updateAllChartsData()
      refreshAllCharts()
    }

    const filterDatasetsBySetOfDates = (datasets, tolerance) => {
      console.log('Filtering datasets by set of dates', datasets, selectedTimeseriesPoints.value)
      if (tolerance == null) {
        tolerance = NODE_DATETIME_VARIATION
      }
      if (selectedTimeseriesPoints.value == null) {
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
          selectedTimeseriesPoints.value.some((timeSeriesPoint) => {
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

      // sort the data within each group by distance to outlet
      for (const date in timeStampGroups) {
        timeStampGroups[date].sort((a, b) => {
          return a.p_dist_out - b.p_dist_out
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
        let minDateTime = null
        let maxDateTime = null
        for (const key in propertyObject) {
          let values = propertyObject[key]
          if (key == 'time_str') {
            // set the min and max date times
            // time_str should be in order but we make sure
            values.sort()
            minDateTime = new Date(values[0])
            maxDateTime = new Date(values[values.length - 1])
          }
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
          minDateTime,
          maxDateTime
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
        medianDateTime: new Date(
          timeRange.value[0] * 1000 + ((timeRange.value[1] - timeRange.value[0]) * 1000) / 2
        ),
        maxDateTime: new Date(timeRange.value[1] * 1000)
      }
      // Green/Blue selected for colorblind safety
      // https://colorbrewer2.org/#type=sequential&scheme=GnBu&n=5
      const newColorScale = chroma
        .scale('GnBu')
        .padding([0.25, 0])
        .domain([chartDates.minDateTime, chartDates.medianDateTime, chartDates.maxDateTime])
      colorScale.value = newColorScale
    }

    const getNodeChartDatasets = (nodes) => {
      // builds the datasets for the long-profile chart. These are labeled
      // using seriesType='swot_node_series' to differentiate them from
      // reach-level data.
      let measurements = nodes.map((node) => {
        const propertiesObj = node.queries[0].results.geojson.features[0].properties
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
      updateColorScale()
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
      const medianDateTime =
        timeStampGroup[Math.floor(timeStampGroup.length / 2)].datetime.getTime()
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
      try {
        const scale = colorScale.value(date)
        const hex = scale.hex()
        return hex
      } catch (error) {
        console.error('Invalid date', date, error)
        return 'black'
      }
    }

    const getDateGradientColors = (dataSet) => {
      if (dataSet.length == 0) {
        return []
      }
      const firstColor = dateGradientColors(dataSet[0].datetime)
      // fill an arry with the same color for each data point
      return Array(dataSet.length).fill(firstColor)
    }

    const getPointBorderColors = (dataSet) => {
      if (!['swot_node_series', 'swot_reach_series'].includes(dataSet.seriesType)) {
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
      if (!['swot_node_series', 'swot_reach_series'].includes(dataSet.seriesType)) {
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
      let qualityLabel = determineQualityLabel(dataPoint)
      if (!qualityLabel) {
        return true // If no quality label, keep the point
      }
      if (!dataQualityFlags.value.includes(parseInt(dataPoint[qualityLabel]))) {
        return false
      }

      // https://www.chartjs.org/docs/latest/configuration/elements.html#point-configuration
      const dataQuality = dataPoint[qualityLabel]
      let pointStyle = 'circle'
      // Values of 0, 1, 2, and 3 indicate good, suspect, degraded, and bad measurements, respectively
      const dataQualityOption = dataQualityOptions.find((option) => option.value == dataQuality)
      if (dataQualityOption) {
        pointStyle = dataQualityOption.pointStyle
      }
      return pointStyle
    }

    const getPointBorderColor = (dataPoint) => {
      let qualityLabel = determineQualityLabel(dataPoint)
      if (!dataQualityFlags.value.includes(parseInt(dataPoint[qualityLabel]))) {
        return false
      }

      // https://www.chartjs.org/docs/latest/configuration/elements.html#point-configuration
      const dataQuality = dataPoint[qualityLabel]
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
        showLine: symbologyContains('Lines'),
        fill: true,
        pointBorderColor: (ctx) => getPointBorderColors(ctx.dataset),
        pointStyle: (ctx) => getPointStyles(ctx.dataset),
        pointBorderWidth: 5,
        borderColor: 'black', // The line fill color.
        backgroundColor: 'black', // The line color
        pointHoverRadius: 15,
        pointHoverBorderWidth: 7,
        pointRadius: getPointRadius,
        borderWidth: getBorderWidth
      }
      return style
    }

    function getPointRadius(context) {
      // if the data point is selected, increase the radius
      const index = context.dataIndex
      if (index == null) {
        return 7
      }
      const dataPoint = context.dataset.data[index]
      if (dataPoint.selected) {
        return 12
      }
      return 7
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
        showLine: symbologyContains('Lines'),
        pointRadius: 7,
        pointHoverRadius: 15,
        //fill: styles.dynamicColors,
        fill: false,
        // color: styles.colors,
        // borderWidth: 1,
        backgroundColor: colors,
        pointBorderColor: (ctx) => getPointBorderColors(ctx.dataset),
        pointStyle: (ctx) => getPointStyles(ctx.dataset),
        // borderColor: styles.dynamicColors, // The line fill color.
        borderColor: colors,
        pointBorderWidth: 3,
        pointHoverBorderWidth: 5
      }
    }

    const updateNodeDataSetStyles = () => {
      // check if there is node data
      if (!hasNodeData.value) {
        return
      }
      updateColorScale()
      nodeChartData.value.datasets.forEach((dataset) => {
        // replace the dataset properties with those from getNodeDataSetStyle
        const updatedStyles = getNodeDataSetStyle(dataset.data)
        for (const key in updatedStyles) {
          // update all of the keys except for pointStyle and pointBorderColor
          // otherwise slow zoom will ensue
          // https://cuahsi.atlassian.net/browse/CAM-499
          if (key != 'pointStyle' && key != 'pointBorderColor') {
            dataset[key] = updatedStyles[key]
          }
        }
      })
      updateSymbology()
    }

    const updateSymbology = () => {
      let showLine = true
      let showMarkers = false
      // if symbology.value is an array of strings, check if it includes 'Lines' or 'Markers'
      if (Array.isArray(symbology.value)) {
        showLine = symbology.value.includes('Lines')
        showMarkers = symbology.value.includes('Markers')
      }
      // iterate over stored charts and update the line visibility
      storedCharts.value.forEach((storedChart) => {
        try {
          if (storedChart.chart != null) {
            storedChart.chart.data.datasets
              .filter((ds) => ds.seriesType != 'computed_series')
              .forEach((dataset) => {
                dataset.showLine = showLine
                dataset.pointRadius = showMarkers ? getPointRadius : 0
              })
            storedChart.chart.update()
          }
        } catch (error) {
          console.error('Error updating chart lines', error)
        }
      })
    }

    const updateAllChartsData = () => {
      // iterate over stored charts and update the line visibility
      storedCharts.value.forEach((storedChart) => {
        try {
          // check if the chart is a node chart or a reach chart
          // and refresh the data accordingly
          if (storedChart.chart.data.datasets[0].seriesType == 'swot_node_series') {
            storedChart.chart.data.datasets = nodeChartData.value.datasets
          } else {
            storedChart.chart.data.datasets = chartData.value.datasets
          }
          updateSymbology()
          storedChart.chart.update()

          // if all datasets in the chart are hidden, alert the user!
          const allHidden = storedChart.chart.data.datasets.every(
            (ds) => ds.hidden || ds.data.length == 0
          )
          if (allHidden) {
            const alertStore = useAlertStore()
            alertStore.displayAlert({
              title: 'No Data to Display',
              text: 'No data available in the selected time range. Please select a broader time range.',
              type: 'warning',
              closable: true,
              duration: 3
            })
          }
        } catch (error) {
          console.error('Error updating chart', error)
        }
      })
    }

    const refreshAllCharts = async () => {
      // iterate over stored charts and refresh
      storedCharts.value.forEach(async (storedChart) => {
        try {
          await storedChart.chart.update()
        } catch (error) {
          console.error('Error refreshing chart', error)
        }
      })
      return
    }

    const storeMountedChart = (chart) => {
      storedCharts.value.push(chart)

      // clean stored charts that are undifined
      cleanStoredCharts()
    }

    const updateRouteAfterPlotChange = async () => {
      const query = {
        variables: activePlt.value.abbreviation,
        plot: chartTab.value,
        symbology: symbology.value,
        showStatistics: showStatistics.value,
        dataQualityFlags: dataQualityFlags.value
        // timeRange: timeRange.value,
      }
      await router.push({
        query
      })
    }

    const checkQueryParams = (to) => {
      let query = to.query
      if (!query) {
        query = router.currentRoute.value.query
      }
      if (query.plot) {
        chartTab.value = query.plot
      }
      if (query.variables) {
        let plt = null
        if (query.plot == 'timeseries') {
          plt = reachCharts.value.find((plt) => plt.abbreviation === query.variables)
        } else {
          plt = nodeCharts.value.find((plt) => plt.abbreviation === query.variables)
        }
        if (plt) {
          activePlt.value = plt
        } else {
          console.error('Invalid Plot Abbreviation', query.variables)
        }
      }
      if (query.showStatistics) {
        showStatistics.value = query.showStatistics == 'true'
      }
      if (query.symbology) {
        // if the query is a string, convert it to an array
        if (typeof query.symbology === 'string') {
          query.symbology = [query.symbology]
        }

        // and remove duplicates
        query.symbology = [...new Set(query.symbology)]

        symbology.value = query.symbology
      }
      if (query.dataQualityFlags) {
        // if the query is a string, convert it to an array
        if (typeof query.dataQualityFlags === 'string') {
          query.dataQualityFlags = [dataQualityFlags]
        }
        // now convert the array of strings to an array of integers
        query.dataQualityFlags = query.dataQualityFlags.map((flag) => parseInt(flag))

        // and remove duplicates
        query.dataQualityFlags = [...new Set(query.dataQualityFlags)]

        dataQualityFlags.value = query.dataQualityFlags
      }
      // TODO: Serialize time range
      // if (query.timeRange) {
      //   featureStore.timeRange = query.timeRange
      // }

      // Watchers to trigger updateRouteAfterPlotChange
      watch(chartTab, () => {
        console.log('Chart Tab Changed', chartTab.value)
        updateRouteAfterPlotChange()
      })
      watch(activePlt, (pre, post) => {
        console.log('Active PLT Changed', pre, post)
        updateRouteAfterPlotChange()
      })
      watch(symbology, () => {
        console.log('Symbology Changed', symbology.value)
        updateRouteAfterPlotChange()
      })
      watch(showStatistics, () => {
        console.log('Show Statistics Changed', showStatistics.value)
        updateRouteAfterPlotChange()
      })
      watch(dataQualityFlags, () => {
        console.log('Data Quality Flags Changed', dataQualityFlags.value)
        updateRouteAfterPlotChange()
      })
      // TODO: watch time range
      // watch(timeRange, () => {
      //   console.log('Time Range Changed', timeRange.value)
      //   updateRouteAfterPlotChange()
      // })
    }

    const cleanStoredCharts = () => {
      storedCharts.value = storedCharts.value.filter((e) => e.chart != undefined)
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
      updateAllChartsData,
      refreshAllCharts,
      filterDatasetsToTimeRange,
      filterDatasetsBySetOfDates,
      dataQualityOptions,
      dataQualityFlags,
      setDatasetVisibility,
      getNodeTimeStamps,
      chartTab,
      nodeCharts,
      reachCharts,
      lakeCharts,
      showStatistics,
      symbology,
      updateSymbology,
      storeMountedChart,
      activePlt,
      generateDataQualityLegend,
      activeNodeChart,
      activeReachChart,
      updateNodeDataSetStyles,
      updateRouteAfterPlotChange,
      checkQueryParams,
      selectedTimeseriesPoints
    }
  },
  {
    // persist: {
    //   // https://prazdevs.github.io/pinia-plugin-persistedstate/guide/config.html#pick
    //   pick: ['showLine', 'dataQualityFlags', 'showStatistics'],
    // }
  }
)
