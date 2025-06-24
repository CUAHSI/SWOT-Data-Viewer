import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useChartsStore } from '@/stores/charts'
import { APP_API_URL } from '@/constants'

export const useStatsStore = defineStore('stats', () => {
  const chartStore = useChartsStore()
  const { nodeChartData, activePlt, showStatistics } = storeToRefs(chartStore)
  const chartStatistics = ref(null)
  async function getStatistics() {
    // compute statistics based on the node series that are visible
    // in the chart.

    let datasets = chartStore.nodeChartData.datasets
      .filter((s) => s.seriesType == 'swot_node_series')
      .filter((s) => s.hidden == false)

    // upate datasets so that is just an array arrays of the datasets.data objects
    datasets = datasets.map((dataset) => {
      return dataset.data
    })

    let stats = await fetch(`${APP_API_URL}/data/compute_node_series`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datasets)
    })
      .then((response) => response.json())
      .then((data) => {
        return data
      })

    // save computed statistics to a reactive variable
    chartStatistics.value = stats
  }

  function buildChartSeries(data, xkey = 'p_dist_out', ykey, series_label, props = {}) {
    let dat = {
      label: series_label,
      data: data,
      parsing: {
        yAxisKey: ykey,
        xAxisKey: xkey
      },
      fill: props.fill || false,
      hidden: props.hidden || false,
      showLine: props.showLine || true,
      borderColor: props.borderColor || 'blue',
      borderWidth: props.borderWidth || 1,
      pointRadius: props.pointRadius || 0,
      seriesType: props.seriesType || 'computed_series'
    }
    return dat
  }

  const generateStatisticsSeries = async () => {
    // compute statistics and return them as chart series

    await getStatistics()

    let statisticSeries = []

    // build chart series for each statistic and set it in nodeChartData.
    // set each of these to hidden.
    for (let stat in chartStatistics.value) {
      // skip Interquartile range because these will added later
      if (stat != 'q0.25' && stat != 'q0.75') {
        let series = buildChartSeries(
          chartStatistics.value[stat],
          'p_dist_out',
          activePlt.value.yvar.abbreviation,
          stat,
          { fill: false, hidden: false }
        )
        statisticSeries.push(series)
      }
      if (stat == 'q0.25') {
        let series = buildChartSeries(
          chartStatistics.value[stat],
          'p_dist_out',
          activePlt.value.yvar.abbreviation,
          'IQR',
          { showLine: true, borderColor: 'gray', borderWidth: 1, pointRadius: 0 }
        )
        statisticSeries.push(series)
      }
      if (stat == 'q0.75') {
        let series = buildChartSeries(
          chartStatistics.value[stat],
          'p_dist_out',
          activePlt.value.yvar.abbreviation,
          stat,
          {
            fill: '-1',
            showLine: true,
            borderColor: 'gray',
            backgroundColor: 'lightgray',
            borderWidth: 1,
            pointRadius: 0
          }
        )
        statisticSeries.push(series)
      }
    }

    return statisticSeries
  }

  const toggleSeriesStatistics = async (visible = true) => {
    // adds and removes computed statistics from the chart

    // get the data from the chart
    let updatedDatasets = nodeChartData.value.datasets

    if (visible) {
      let statisticSeries = await generateStatisticsSeries()

      // push statisticSeries elements into the updatedDatasets array
      updatedDatasets = updatedDatasets.concat(statisticSeries)
    } else {
      // remove the computed statistics from the chart
      updatedDatasets = updatedDatasets.filter((s) => s.seriesType != 'computed_series')
    }

    // save these data to the chartStore
    chartStore.updateNodeChartData(updatedDatasets)

    // update the charts
    chartStore.updateAllChartsData()
  }

  const recomputeStatsAndUpdateCharts = async () => {
    if (showStatistics.value == true) {
      // remove statistics from the chart
      let datasets = chartStore.nodeChartData.datasets.filter(
        (s) => s.seriesType != 'computed_series'
      )

      // recompute statistics
      let statisticSeries = await generateStatisticsSeries()

      // push statisticSeries elements into the datasets array
      datasets = datasets.concat(statisticSeries)

      // save these data to the chartStore
      chartStore.updateNodeChartData(datasets)

      // update the chart
      chartStore.refreshAllCharts()
      toggleSeriesStatistics(chartStore.showStatistics.value)
    }
  }

  return {
    toggleSeriesStatistics,
    generateStatisticsSeries,
    recomputeStatsAndUpdateCharts
  }
})
