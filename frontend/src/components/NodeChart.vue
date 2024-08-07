<template>
  <v-container class="overflow-auto">
    <v-row>
      <v-col xs="12" lg="9">
        <v-sheet
          :min-height="lgAndUp ? '65vh' : '50vh'"
          :max-height="lgAndUp ? '100%' : '20vh'"
          max-width="100%"
          min-width="500px"
        >
          <Line :data="chartData" :options="options" ref="line" :plugins="[Filler]" />
        </v-sheet>
        <v-sheet class="pa-2" color="input">
          <TimeRangeSlider
            ref="timeRef"
            @update="timeSliderUpdated"
            @updateComplete="timeRangeUpdateComplete"
          />
        </v-sheet>
      </v-col>
      <v-col>
        <v-sheet>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title> Series Options </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div>
                  <v-switch
                    label="Statistics"
                    v-model="showStatistics"
                    color="primary"
                    @change="toggleSeriesStatistics(showStatistics)"
                  >
                    ></v-switch
                  >
                  <v-tooltip activator="parent" location="start"
                    >Enable/Disable computed statistics in the long-profile plot.</v-tooltip
                  >
                </div>

                <DataQuality
                  v-model="dataQuality"
                  id="dataQuality"
                  :data="chartStore.chartData"
                  @qualityUpdated="filterAllDatasets"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
          <v-select
            label="Plot Style"
            v-model="plotStyle"
            :items="['Scatter', 'Connected']"
            @update:modelValue="updateChartLine()"
          >
          </v-select>
          <v-btn :loading="downloading.chart" @click="downloadChart()" class="ma-1" color="input">
            <v-icon :icon="mdiDownloadBox"></v-icon>
            Download Chart
          </v-btn>
          <v-btn :loading="downloading.csv" @click="downCsv()" class="ma-1" color="input">
            <v-icon :icon="mdiFileDelimited"></v-icon>
            Download CSV
          </v-btn>
          <v-btn :loading="downloading.json" @click="downJson()" class="ma-1" color="input">
            <v-icon :icon="mdiCodeJson"></v-icon>
            Download JSON
          </v-btn>
          <v-btn @click="resetZoom()" color="input" class="ma-1">
            <v-icon :icon="mdiMagnifyMinusOutline"></v-icon>
            Zoom to Exent
          </v-btn>
          <v-btn @click="resetData()" color="input" class="ma-1">
            <v-icon :icon="mdiEraser"></v-icon>
            Reset Data
          </v-btn>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { capitalizeFirstLetter } from '@/_helpers/charts/plugins'
import { Filler } from 'chart.js'
import { Line } from 'vue-chartjs'
import 'chartjs-adapter-date-fns'
import { ref } from 'vue'
import { downloadMultiNodesCsv, downloadMultiNodesJson } from '../_helpers/hydroCron'
import { useDisplay } from 'vuetify'
import TimeRangeSlider from '@/components/TimeRangeSlider.vue'
import DataQuality from '@/components/DataQuality.vue'
import { useChartsStore } from '@/stores/charts'
import { APP_API_URL } from '@/constants'

const { lgAndUp } = useDisplay()

const chartStore = useChartsStore()

const props = defineProps({ data: Object, chosenVariable: Object })
const line = ref(null)
const downloading = ref({ csv: false, json: false, chart: false })
const showStatistics = ref(false)
const dataQuality = ref([0, 1, 2, 3])
const plotStyle = ref('Connected')
const chartStatistics = ref(null)
const timeRef = ref()
let chartData = ref(chartStore.nodeChartData)

const setDefaults = () => {
  // sets page elements back to their default values.

  // set statistics switch to off
  showStatistics.value = false
}

const setParsing = (datasets) => {
  datasets.forEach((dataset) => {
    dataset.parsing.yAxisKey = props.chosenVariable.abbreviation
  })
}
if (props.chosenVariable !== undefined && chartData.value.datasets !== undefined) {
  setParsing(chartData.value.datasets)
}

const yLabel = `${props.chosenVariable?.name} (${props.chosenVariable?.unit})`
const title = `${props.data.title}: ${props.chosenVariable?.name} vs Distance`

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        // hide the q0.75 series from the legend. This is because the interquartile range
        // will be toggled by a single series. We'll use q0.25 for this.
        filter: (item) => item.text !== 'q0.75'
      },
      onClick: function (e, legendItem, legend) {
        const index = legendItem.datasetIndex
        const ci = legend.chart

        if (legendItem.text == 'IQR') {
          // toggle the IQR data series
          toggleByIndex(index)

          // toggle the q0.75 data series that is not displayed in the legend. This will make
          // IQR appear as a patch instead of a line.
          let isHidden = line.value.chart.data.datasets.filter((d) => d.label == 'q0.75')[0].hidden
          line.value.chart.data.datasets.filter((d) => d.label == 'q0.75')[0].hidden = !isHidden
          line.value.chart.update()
        } else {
          toggleByIndex(index)
        }

        function toggleByIndex(index) {
          if (ci.isDatasetVisible(index)) {
            ci.hide(index)
            legendItem.hidden = true
          } else {
            ci.show(index)
            legendItem.hidden = false
          }
        }
      }
    },
    title: {
      display: true,
      text: title,
      font: {
        size: 16
      }
    },
    customCanvasBackgroundColor: {
      color: 'white'
    },
    zoom: {
      pan: {
        enabled: true,
        mode: 'xy'
      },
      zoom: {
        wheel: {
          enabled: true
        },
        pinch: {
          enabled: false
        },
        drag: {
          enabled: false
        },
        mode: 'xy'
      }
    },
    tooltip: {
      // https://www.chartjs.org/docs/latest/configuration/tooltip.html
      callbacks: {
        title: function (context) {
          return `Distance: ${context[0].parsed.x} m`
        },
        label: function (context) {
          // var label = context.dataset.label || '';
          let selectedVariable = props.chosenVariable
          let label = `${capitalizeFirstLetter(selectedVariable.abbreviation)}`
          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            // label += new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 5 }).format(context.parsed.y);
            label += context.parsed.y
          }
          label += ` ${selectedVariable.unit}`
          // add the timestamp as well
          return label
        },
        footer: function (context) {
          const dataQualityOption = chartStore.dataQualityOptions.find(
            (option) => option.value == context[0]?.raw?.node_q
          )
          if (dataQualityOption) {
            return `\n Data Quality: ${dataQualityOption.label}`
          }
          return ''
        }
      },
      displayColors: false
    }
  },
  scales: {
    x: {
      type: 'linear',
      title: {
        display: true,
        text: 'Distance from outlet (m)'
      },
      reverse: true
    },
    y: {
      title: {
        display: true,
        text: yLabel
      }
    }
  }
}

const filterAllDatasets = (dataQualityValues) => {
  chartStore.filterDataQuality(dataQualityValues, line.value.chart.data.datasets, 'node_q')
  setParsing(line.value.chart.data.datasets)
  line.value.chart.update()
}

const resetZoom = () => {
  line.value.chart.resetZoom()
}

const getChartName = () => {
  let identifier = `${props.data.datasets[0].label}-${props.chosenVariable.abbreviation}`
  identifier = identifier.replace(/[^a-zA-Z0-9]/g, '_')
  return `${identifier}.png`
}

const downloadChart = async () => {
  downloading.value.chart = true
  const filename = getChartName()
  // change the chart background color to white
  line.value.chart.canvas.style.backgroundColor = 'white'

  const image = line.value.chart.toBase64Image('image/png', 1)
  const link = document.createElement('a')
  link.href = image
  link.download = filename
  link.click()
  downloading.value.chart = false
}

const downCsv = async () => {
  downloading.value.csv = true
  await downloadMultiNodesCsv()
  downloading.value.csv = false
}

const downJson = async () => {
  downloading.value.json = true
  await downloadMultiNodesJson()
  downloading.value.json = false
}

const updateChartLine = () => {
  let showLine = false
  if (plotStyle.value === 'Connected') {
    showLine = true
  }
  line.value.chart.data.datasets.forEach((dataset) => {
    dataset.showLine = showLine
    setParsing(line.value.chart.data.datasets)
  })
  line.value.chart.update()
}

const resetData = () => {
  // Resets the node chart to its initial state. This requires
  // making all swot_node_series visible, removing any additional
  // series that have been added to the chart (e.g. statistics),
  // and setting page components to their initial state.

  // remove all non-swot series from the chart. This is necessary
  // to reset the chart to its initial state.
  let datasets = chartData.value.datasets.filter((s) => s.seriesType == 'swot_node_series')

  // turn on all hidden swot node series datasets
  datasets
    .filter((s) => s.seriesType == 'swot_node_series')
    .forEach(function (s) {
      s.hidden = false
    })

  // set these datasets in the chart store
  chartStore.updateNodeChartData(datasets)

  // Reset timeslider extents to the full range of the data
  timeRef.value.setInitialState()

  // reset page components to their default state, e.g. statistics switch
  setDefaults()

  // update the chart
  line.value.chart.data.datasets = chartData.value.datasets
  line.value.chart.update()
}

const timeSliderUpdated = () => {
  // This function is called when the time slider is updated.
  // It filters the chart data to the data that are active in the time slider range.

  line.value.chart.data.datasets = chartData.value.datasets
  line.value.chart.update()
}

const timeRangeUpdateComplete = async () => {
  // This function is called when the time slider update is complete,
  // and is used to update the chart with series that need to be
  // recomputed.

  console.log('Time range update complete')
  // TODO: re-compute statistics if they have been enabled
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
    line.value.chart.data.datasets = chartData.value.datasets
    line.value.chart.update()
  }
}

async function getStatistics() {
  // compute statistics based on the node series that are visible
  // in the chart.

  //let datasets = chartStore.nodeChartData.datasets
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

  // build chart series for each statistic and set it in chartData.
  // set each of these to hidden.
  for (let stat in chartStatistics.value) {
    // skip Interquartile range because these will added later
    if (stat != 'q0.25' && stat != 'q0.75') {
      let series = buildChartSeries(
        chartStatistics.value[stat],
        'p_dist_out',
        props.chosenVariable.abbreviation,
        stat,
        { fill: false, hidden: false }
      )
      statisticSeries.push(series)
    }
    if (stat == 'q0.25') {
      let series = buildChartSeries(
        chartStatistics.value[stat],
        'p_dist_out',
        props.chosenVariable.abbreviation,
        'IQR',
        { showLine: true, borderColor: 'gray', borderWidth: 1, pointRadius: 0 }
      )
      statisticSeries.push(series)
    }
    if (stat == 'q0.75') {
      let series = buildChartSeries(
        chartStatistics.value[stat],
        'p_dist_out',
        props.chosenVariable.abbreviation,
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
  let updatedDatasets = line.value.chart.data.datasets

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

  // update the chart
  line.value.chart.data.datasets = chartData.value.datasets
  // line.value.chart.data.datasets = updatedDatasets;
  line.value.chart.update()
}
</script>
