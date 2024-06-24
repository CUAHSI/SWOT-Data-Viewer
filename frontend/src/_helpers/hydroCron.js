import { HYDROCRON_URL } from '@/constants'
import { useFeaturesStore } from '@/stores/features'
import { useAlertStore } from '@/stores/alerts'
import { useHydrologicStore } from '@/stores/hydrologic'

const queryHydroCron = async (swordFeature = null, output = 'geojson') => {
  const hydrologicStore = useHydrologicStore()
  const alertStore = useAlertStore()
  if (swordFeature == null) {
    console.error('No hydroCron query params provided')
    return
  }
  console.log('Querying HydroCron for swordFeature', swordFeature)
  let params = {}

  // TODO: get the start and end time from the date range
  let feature_type = swordFeature?.properties?.node_id == undefined ? 'Reach' : 'Node'
  swordFeature.feature_type = feature_type
  let feature_id = feature_type === 'Reach' ? swordFeature?.properties?.reach_id : swordFeature?.properties?.node_id
  swordFeature.feature_id = feature_id

  let fields = hydrologicStore.selectedVariables.map((variable) => variable.abbreviation)
  console.log('Selected fields:', fields)

  // remove any variables that aren't allowed for this feature type
  const allowedAbbreviations = hydrologicStore
    .queryVariables(feature_type)
    .map((v) => v.abbreviation)
  console.log('Filtering to only include allowed fields:', allowedAbbreviations)
  fields = fields.filter((abbreviation) => {
    return allowedAbbreviations.includes(abbreviation)
  })
  fields.join(',')
  console.log('Fetching for selected fields', fields)

  const additional = hydrologicStore
    .queryVariables(feature_type, true)
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

  params = {
    feature: feature_type,
    feature_id: feature_id,
    start_time: '2024-01-01T00:00:00Z',
    end_time: '2024-10-30T00:00:00Z',
    output: output,
    fields: fields,
    // https://podaac.github.io/hydrocron/timeseries.html#compact-string-required-no
    compact: 'false'
  }
  let response = await fetchHydroCronData(HYDROCRON_URL, params, swordFeature)
  if (response == null) {
    return
  }
  // TODO handle if the feature is already selected (in case of csv download)
  if (output === 'csv') {
    return response.results.csv
  }
  return response
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
    const processedResult = await processHydroCronResult(result, params, swordFeature)
    return processedResult
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
    let query = await response.json()
    if (response.status == 400 || query.hits == undefined || query.hits < 1) {
      alertStore.displayAlert({
        title: 'No data found',
        text: `No data found for ${JSON.stringify(params)}`,
        type: 'warning',
        closable: true,
        duration: 6
      })
      return null
    }

    console.log('Saving results to feature', swordFeature)
    query.params = params
    // check if the feature already has queries
    if (swordFeature.queries === undefined) {
      swordFeature.queries = []
    }
    swordFeature.queries.push(query)
    return query
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

async function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

async function downloadFeatureJson(feature = null) {
  if (feature == null) {
    const featuresStore = useFeaturesStore()
    feature = featuresStore.activeFeature
  }
  const wrapper = {
    queries: feature.queries
  }
  // alternatively, we could use the geojson from the feature
  // feature.queries[0].results.geojson
  const jsonData = JSON.stringify(wrapper)
  const blob = new Blob([jsonData], { type: 'application/json' })
  const filename = getLongFilename(feature) + '.json'
  downloadBlob(blob, filename)
}

async function downloadMultiNodesJson(nodes = []) {
  if (nodes.length === 0) {
    nodes = useFeaturesStore().nodes
  }
  const wrapper = {
    nodes: nodes
  }
  const jsonData = JSON.stringify(wrapper)
  const blob = new Blob([jsonData], { type: 'application/json' })
  let filename = getLongFilename(nodes[0]) + '.json'
  filename = `${nodes.length}_nodes_${filename}`
  downloadBlob(blob, filename)
}

async function downloadMultiNodesCsv(nodes = []) {
  if (nodes.length === 0) {
    nodes = useFeaturesStore().nodes
  }
  const csvData = await Promise.all(
    nodes.map(async (node, index) => {
      const csv = await queryHydroCron(node, 'csv')
      // strip the header from all but the first node
      if (index !== 0) {
        return csv.split('\n').slice(1).join('\n')
      }
      return csv
    })
  )
  console.log('CSV data:', csvData)
  const blob = new Blob(csvData, { type: 'text/csv' })
  let filename = getLongFilename(nodes[0]) + '.csv'
  filename = `${nodes.length}_nodes_${filename}`
  downloadBlob(blob, filename)
}

async function downloadCsv(feature = null) {
  // if feature not defined, use featuresStore.activeFeature
  if (feature == null) {
    const featuresStore = useFeaturesStore()
    feature = featuresStore.activeFeature
  }
  const csvData = await queryHydroCron(feature, 'csv')
  const blob = new Blob([csvData], { type: 'text/csv' })
  const filename = `${getLongFilename(feature)}.csv`
  downloadBlob(blob, filename)
}

function getLongFilename(feature = null) {
  if (feature == null) {
    const featuresStore = useFeaturesStore()
    feature = featuresStore.activeFeature
  }
  const featureType = feature.feature_type
  const riverName = feature.properties.river_name
  const reachId = feature.properties.reach_id
  const startTime = feature.queries[0].params.start_time
  const endTime = feature.queries[0].params.end_time
  let filename = `${featureType}_${riverName}_${reachId}_${startTime}_${endTime}`
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()
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
    // TODO: for now we just use the first query
    where: `reach_id = ${reachFeature.queries[0].params.feature_id}`,
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

  // SWORD Nodes have attributes, insteady of properties. For consistency, we rename attributes to properties
  data.features.forEach((node) => {
    Object.defineProperty(node, 'properties', Object.getOwnPropertyDescriptor(node, 'attributes'))
    delete node.attributes
  })
  console.log('Nodes for reach', data.features)
  return data.features
}

async function getNodeDataForReach(reachFeature) {
  console.log('Retrieving nodes for reach', reachFeature)
  let nodes = await getNodesFromReach(reachFeature)
  reachFeature.nodes = nodes
  await getDataForNodes(nodes)
  console.log('Reach with updated node data', reachFeature)
  return reachFeature
}

async function getDataForNodes(nodes) {
  const featureStore = useFeaturesStore()
  console.log('Retrieving data for nodes', nodes)
  await Promise.all(
    nodes.map(async (node) => {
      await queryHydroCron(node)
    })
  )
  console.log('Nodes with data:', nodes)
  // TODO: right now we just keep a single set of nodes. But we could instead retain all node data
  // featureStore.nodes.push(...nodes)
  featureStore.nodes = nodes
  return nodes
}

export {
  queryHydroCron,
  downloadFeatureJson,
  downloadMultiNodesJson,
  downloadMultiNodesCsv,
  downloadCsv,
  getNodesFromReach,
  getNodeDataForReach,
  getDataForNodes
}
