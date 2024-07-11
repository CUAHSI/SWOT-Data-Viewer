<template>
  <v-container class="overflow-auto">
    <v-row>
      <v-col lg="10">
        <v-sheet :min-height="lgAndUp ? '65vh' : '50vh'" :max-height="lgAndUp ? '100%' : '20vh'" max-width="100%"
          min-width="500px">
          <Line :data="chartData" :options="options" ref="line" :plugins="[customCanvasBackgroundColor, zoomPlugin]" />
        </v-sheet>
        <v-sheet class="pa-2" color="input">
          <TimeRangeSlider @update="resetData" />
        </v-sheet>
      </v-col>
      <v-col lg="2">
        <v-sheet>
          <v-select label="Plot Style" v-model="plotStyle" :items="['Scatter', 'Connected',]"
            @update:modelValue="updateChartLine()"></v-select>
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
            Reset Zoom
          </v-btn>
          <v-btn @click="resetData()" color="input" class="ma-1">
            <v-icon :icon="mdiEraser"></v-icon>
            Refresh Data
          </v-btn>
          <v-btn @click="plotStatisics()" color="input" class="ma-1">
            <v-icon :icon="mdiEraser"></v-icon>
            Patch
          </v-btn>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import 'chartjs-adapter-date-fns';
import { ref } from 'vue'
import { customCanvasBackgroundColor } from '@/_helpers/charts/plugins'
import { mdiDownloadBox, mdiFileDelimited, mdiCodeJson, mdiMagnifyMinusOutline, mdiEraser } from '@mdi/js'
import { downloadMultiNodesCsv, downloadMultiNodesJson } from '../_helpers/hydroCron';
import { useDisplay } from 'vuetify'
import zoomPlugin from 'chartjs-plugin-zoom';
import { capitalizeFirstLetter } from '@/_helpers/charts/plugins'
import TimeRangeSlider from '@/components/TimeRangeSlider.vue'

const { lgAndUp } = useDisplay()

const props = defineProps({ data: Object, chosenVariable: Object })
const line = ref(null)
const downloading = ref({ csv: false, json: false, chart: false })

const plotStyle = ref('Connected')


ChartJS.register(LinearScale, TimeScale, PointElement, LineElement, Title, Tooltip, Legend, customCanvasBackgroundColor, zoomPlugin)
// TODO: might need a more efficient way of doing this instead of re-mapping the data
// Ideally use the store directly instead of passing it as a prop
let chartData = ref(props.data)
let minMaxData = JSON.parse(JSON.stringify(chartData.value.datasets.slice(0, 2)));

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
    },
    title: {
      display: true,
      text: title,
      font: {
        size: 16
      },
    },
    customCanvasBackgroundColor: {
      color: 'white',
    },
    zoom: {
      pan: {
        enabled: true,
        mode: 'xy',
      },
      zoom: {
        wheel: {
          enabled: true,
        },
        pinch: {
          enabled: false
        },
        drag: {
          enabled: false
        },
        mode: 'xy',
      }
    },
    tooltip: {
      // https://www.chartjs.org/docs/latest/configuration/tooltip.html
      callbacks: {
        label: function (context) {
          // var label = context.dataset.label || '';
          let selectedVariable = props.chosenVariable
          let label = `${capitalizeFirstLetter(selectedVariable.abbreviation)}`
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            // label += new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 5 }).format(context.parsed.y);
            label += context.parsed.y
          }
          label += ` ${selectedVariable.unit}`
          // add the timestamp as well
          return label;
        },
        title: function (context) {
          return `Distance: ${context[0].parsed.x} m`
        },
      },
      displayColors: false,
    },
  },
  scales: {
    x: {
      type: 'linear',
      title: {
        display: true,
        text: 'Distance from outlet (m)'
      },
      reverse: true,
    },
    y: {
      title: {
        display: true,
        text: yLabel
      }
    }
  }
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
  // remove all datasets except the ones returned by HydroChron. 
  // TODO: This is done by explicitly removing min, max, and mean however
  // this should instead match series based on datetime string instead.
  let chartDatasets = chartData.value.datasets
                    .filter(dataset => !['min', 'max', 'mean']
                    .some(word => dataset.label.includes(word)));
  line.value.chart.data.datasets = chartDatasets
  line.value.chart.update()
}

const computeStatisics = (chartDataSets) => {
  // --------------------------------------------------------------------------------
  // Description: Computes node-level statistics for the SWOT series that are 
  //              currently displayed in the graph interface.
  //  
  //  Returns
  //  =======
  //  Object { minimum: Object,
  //           maximum: Object,
  //           mean:    Object }
  //  - minimum = the minimum value for each node along the reach, for each variable
  //  - maximum = the maximum value for each node along the reach, for each variable
  //  - mean    = the mean value for each node along the reach, for each variable
  // --------------------------------------------------------------------------------


  // convert the chartData into an array structure that's easier to work with
  let dat = [];
//  for (let j = 0; j <= chartData.value.datasets.length - 1; j++) {
  for (let j = 0; j <= chartDataSets.length - 1; j++) {
    dat[j] = [... chartDataSets[j].data];
  }
  
  // Get all keys that contain variables that we would want to plot on the y axis.
  // These are the only variables for which statistics will be computed.
  let keys = Object.keys(dat[0][0])
              .filter((key) => !key.includes('_units'))
              .filter((key) => !['time_str', 'p_dist_out', 'datetime', 'node_q'].includes(key));

  // Get a list of all unique node distances in the dataset. We need to align all of the datasets
  // such that they all have the same number of nodes. Insert NaN values where a node is missing
  // from a dataset.
  let node_dists = [... new Set([... new Set(dat.map(d=>d.map(x=>x.p_dist_out)))].flat())]

  // Loop over node_dists. Check if node_dist exists in array, set n/a if not and exclude from min/max calculation
  for (let i = 0; i <= node_dists.length - 1; i++) {
    let nd = node_dists[i];
    for (let j = 0; j <= dat.length-1; j++) {
      // Check to see if the node distance is found in the current array
      // if not, insert a new object with NaN values here.
      let res = dat[j].filter(res => res.p_dist_out == nd);
      if (res.length == 0) {
        // Create a new object based off the previous record (or next record)
        // in the case that this is the first element of the array
        let newNode;
        if (i > 0) {
          newNode = {... dat[j][i]};
        }
        else {
          newNode = {... dat[j][i]};
        }
        newNode['p_dist_out'] == nd;
        for (let key of keys) {
          newNode[key] = Number.NaN;
        }
        // Insert the new object using the previous index
        dat[j].splice(i, 0, newNode);
      }
    }
  }

  // create arrays of the variables for which statistics will be computed
  let datStats = {};
  for (let key of keys) {
    if (!(key in datStats)) {
      datStats[key] = [];
    }
  }
  for (let i = 0; i <= node_dists.length - 1; i++) {
    for (let key of keys) {
      datStats[key][i] = [];
      for (let j = 0; j <= dat.length - 1; j++ ) {
      // Loop over keys and put their values into the datStats object, ignoring NaNs
        if (!isNaN(parseFloat(dat[j][i][key]))) {
          datStats[key][i].push(parseFloat(dat[j][i][key]));
        }
      }
    }
  }

  // initialize objects to store the computed statistics
  let datMin  = {};
  let datMax  = {};
  let datMean = {};
  for (let key of keys) {
    datMin[key]  = [];
    datMax[key]  = [];
    datMean[key] = [];
  }

  // compute statistics
  for (let i = 0; i <= node_dists.length - 1; i++) {
    for (let key of keys) {
      datMin[key].push(datStats[key][i].reduce((a, b) => Math.min(a, b)));
      datMax[key].push(datStats[key][i].reduce((a, b) => Math.max(a, b)));
      datMean[key].push(datStats[key][i].reduce((a, b) => a + b) / datStats[key][i].length);
    }
  }

  // Return the computed statistics
  return {minimum: datMin,
          maximum: datMax,
          mean: datMean,
          node_dist: node_dists}
}

const plotStatisics = () => {

  // determine which series should be used to compute the statistics
  // only pass those that don't include the min, max, or mean in their label
  let chartDatasets = chartData.value.datasets
                    .filter(dataset => !['min', 'max', 'mean']
                    .some(word => dataset.label.includes(word)));
  
  // set chartData.datasets to the chartDatasets
  chartData.value.datasets = chartDatasets

  // compute the statistics
  let stats = computeStatisics(chartDatasets)

  // turn off all other lines in the chart
  chartData.value.datasets.forEach((dataset) => {
    dataset.showLine = false
  })

  // add datMin, datMax, and datMean to the chart
  let key = 'wse';
  let minData = {
    label: `min_${key}`,
    data: stats.minimum[key],
    parsing: {
      yAxisKey: key
    },
    fill: false,
    showLine: true,
    borderColor: 'red',
    borderWidth: 1,
    pointRadius: 0,
  }
  chartData.value.datasets.push(minData)
  
  let maxData = {
    label: `max_${key}`,
    data: stats.maximum[key],
    parsing: {
      yAxisKey: key
    },
    fill: false,
    showLine: true,
    borderColor: 'green',
    borderWidth: 1,
    pointRadius: 0,
  }
  chartData.value.datasets.push(maxData)
  
  let meanData = {
    label: `mean_${key}`,
    data: stats.mean[key],
    parsing: {
      yAxisKey: key
    },
    fill: false,
    showLine: true,
    borderColor: 'blue',
    borderWidth: 1,
    pointRadius: 0,
  }
  chartData.value.datasets.push(meanData)

  // update the chart
  line.value.chart.data.datasets = chartData.value.datasets
  line.value.chart.update()

}

</script>
