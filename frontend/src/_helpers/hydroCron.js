import { HYDROCRON_URL } from '@/constants'
import { useFeaturesStore } from '@/stores/features'
import { useAlertStore } from '@/stores/alerts'
import { useHydrologicStore } from '@/stores/hydrologic'
import { useChartsStore } from '@/stores/charts'
import { buildFakeData, knownQueriesWithData } from '@/_helpers/fakeData'

const queryHydroCron = async (swordFeature = null, output = 'geojson') => {
  const featuresStore = useFeaturesStore()
  const chartStore = useChartsStore()
  const hydrologicStore = useHydrologicStore()
  const alertStore = useAlertStore()
  const url = `${HYDROCRON_URL}/v1/timeseries`

  if (swordFeature == null && !featuresStore.shouldFakeData) {
    console.error('No hydroCron query params, and shouldFakeData is false')
    return
  }
  console.log('Querying HydroCron for swordFeature', swordFeature)
  let params = {}

  let fields = hydrologicStore.selectedVariables.map((variable) => variable.abbreviation).join(',')
  const additional = hydrologicStore.alwaysQueryVariables
    .map((variable) => variable.abbreviation)
    .join(',')
  if (additional !== '') {
    fields += ',' + additional
  }
  console.log('Fetching for selected fields', fields)

  if (fields === '') {
    console.error('No variables selected')
    alertStore.displayAlert({
      title: 'Error fetching SWOT data',
      text: 'No variables selected',
      type: 'error',
      closable: true,
      duration: 3
    })
    return
  }

  if (!featuresStore.shouldFakeData) {
    // TODO: get the feature type dynamically
    // get the start and end time from the date range
    let feature_id = swordFeature?.properties?.reach_id
    if (feature_id == undefined) {
      feature_id = swordFeature.params.feature_id
    }
    params = {
      feature: 'Reach',
      feature_id: feature_id,
      start_time: '2024-01-01T00:00:00Z',
      end_time: '2024-10-30T00:00:00Z',
      output: output,
      fields: fields
    }
  } else {
    // Build fake data
    // get a random known query from the knownQueriesWithData array
    params = knownQueriesWithData[Math.floor(Math.random() * knownQueriesWithData.length)]
    params.fields = fields
    params.output = output
    console.log('Faked params', params)
  }
  let response = await fetchHydroCronData(url, params, swordFeature)
  if (response == null) {
    return
  }
  // TODO handle if the feature is already selected (in case of csv download)
  if (output === 'csv') {
    return response.results.csv
  }
  featuresStore.mergeFeature(response)
  if (featuresStore.shouldFakeData) {
    let fakeData = buildFakeData(featuresStore.selectedFeatures)
    // update the chartData before selecting the feature otherwise it will show blank
    chartStore.chartData = fakeData
    console.log('Fake data', fakeData)
  } else {
    // chartStore.buildChart([...featuresStore.selectedFeatures, response])
    chartStore.buildChart(featuresStore.selectedFeatures)
  }
}

const fetchHydroCronData = async (url, params, swordFeature) => {
  const alertStore = useAlertStore()
  const searchParams = new URLSearchParams(params)
  let query = url + '?' + searchParams.toString()
  try {
    let result = await fetch(query, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return processHydroCronResult(result, params, swordFeature)
  } catch (e) {
    console.error('Error fetching data', e)
    alertStore.displayAlert({
      title: 'Error fetching SWOT data',
      text: `Error while fetching SWOT data from ${url}: ${e}`,
      type: 'error',
      closable: true,
      duration: 3
    })
  }
}

const processHydroCronResult = async (response, params, swordFeature) => {
  // TODO check the content type and handle it
  // application/json
  // console.log(response.headers.get('Content-Type'))
  const alertStore = useAlertStore()
  // https://podaac.github.io/hydrocron/timeseries.html#response-codes
  if (response.status < 500) {
    let data = await response.json()
    console.log('Swot data response', data)
    if (response.status == 400 || data.hits == undefined || data.hits < 1) {
      alertStore.displayAlert({
        title: 'No data found',
        text: `No data found for ${JSON.stringify(params)}`,
        type: 'warning',
        closable: true,
        duration: 6
      })
      return null
    }
    data.params = params
    if (swordFeature?.properties) {
      data.sword = swordFeature.properties
      data.id = swordFeature.properties.OBJECTID
    }
    return data
  } else {
    alertStore.displayAlert({
      title: 'Error fetching SWOT data',
      text: `Error while fetching SWOT data: ${response.statusText}`,
      type: 'error',
      closable: true,
      duration: 3
    })
  }
}

async function downloadJson(feature = null) {
  if (feature == null) {
    const featuresStore = useFeaturesStore()
    feature = featuresStore.activeFeature
  }
  const jsonData = JSON.stringify(feature.sword)
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${getLongFilename(feature)}.json`

  link.click()

  URL.revokeObjectURL(url)
}

async function downloadCsv(feature = null) {
  // if feature not defined, use featuresStore.activeFeature
  if (feature == null) {
    const featuresStore = useFeaturesStore()
    feature = featuresStore.activeFeature
  }
  const csvData = await queryHydroCron(feature, 'csv')
  const blob = new Blob([csvData], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${getLongFilename(feature)}.csv`

  link.click()

  URL.revokeObjectURL(url)
}

function getLongFilename(feature = null) {
  if (feature == null) {
    const featuresStore = useFeaturesStore()
    feature = featuresStore.activeFeature
  }
  const featureType = feature.params.feature
  const riverName = feature.sword.river_name
  const reachId = feature.sword.reach_id
  const startTime = feature.params.start_time
  const endTime = feature.params.end_time
  let filename = `${featureType}_${riverName}_${reachId}_${startTime}_${endTime}`
  filename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  return filename
}

/**
 * Retrieves nodes from a reach.
 *
 * @param {Object} feature - The feature object representing the reach.
 * @returns {Promise} - A promise that resolves with the nodes from the reach.
 */
async function getNodesFromReach(reachFeature) {
  let url =
    'https://arcgis.cuahsi.org/arcgis/rest/services/SWOT/world_SWORD_nodes_mercator/FeatureServer/0/query'
  let params = {
    f: 'json',
    // where: `reach_id = ${reachFeature.properties.reach_id}`,
    where: `reach_id = ${reachFeature.params.feature_id}`,
    outFields: '*'
    // returnGeometry: true,
    // spatialRel: 'esriSpatialRelIntersects',
    // outSR: 4326
  }
  let query = Object.keys(params)
    .map((key) => key + '=' + params[key])
    .join('&')
  let response = await fetch(`${url}?${query}`)
  let data = await response.json()
  return data.features
}

export { queryHydroCron, downloadJson, downloadCsv, getNodesFromReach }
