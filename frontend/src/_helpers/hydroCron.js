import { ENDPOINTS } from '@/constants'
import { useFeaturesStore } from '@/stores/features'
import { useAlertStore } from '@/stores/alerts'
import { useHydrologicStore } from '@/stores/hydrologic'
import { EARLIEST_HYDROCRON_DATETIME } from '../constants'

String.prototype.hashCode = function () {
  var hash = 0,
    i,
    chr
  if (this.length === 0) return hash
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

const MS_TO_KEEP_CACHE = 1000 * 60 * 60 * 24 * 7 // 7 days

const queryHydroCron = async (swordFeature = null, output = 'geojson') => {
  const hydrologicStore = useHydrologicStore()
  const alertStore = useAlertStore()
  if (swordFeature == null) {
    console.error('No hydroCron query params provided')
    return
  }
  let params = {}

  // TODO: get the start and end time from the date range
  let feature_type = swordFeature?.feature_type
  if (!feature_type) {
    // if the feature type is not set, we try to determine it from the feature
    const featuresStore = useFeaturesStore()
    feature_type = featuresStore.determineFeatureType(swordFeature)
  }
  if (!feature_type) {
    console.error('No feature type found for hydroCron query')
  }
  swordFeature.feature_type = feature_type
  let feature_id = null
  switch (feature_type) {
    case 'Reach':
      feature_id = swordFeature?.properties?.reach_id
      break
    case 'Node':
      feature_id = swordFeature?.properties?.node_id
      break
    case 'PriorLake':
      feature_id = swordFeature?.properties?.lake_id
      break
  }
  swordFeature.feature_id = feature_id

  let fields = hydrologicStore.selectedVariables.map((variable) => variable.abbreviation)

  // remove any variables that aren't allowed for this feature type
  const allowedAbbreviations = hydrologicStore
    .queryVariables(feature_type)
    .map((v) => v.abbreviation)
  fields = fields.filter((abbreviation) => {
    return allowedAbbreviations.includes(abbreviation)
  })
  fields.join(',')

  const additional = hydrologicStore
    .queryVariables(feature_type, true)
    .map((variable) => variable.abbreviation)
    .join(',')
  if (additional !== '') {
    fields += ',' + additional
  }

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

  const start_time = EARLIEST_HYDROCRON_DATETIME
  const end_time = new Date(Date.now() + MS_TO_KEEP_CACHE).toISOString().split('.')[0] + 'Z'

  // determine which collection name to use based on feature type ('Reach' or 'PriorLake')
  let collection_name = 'SWOT_L2_HR_RiverSP_D'
  if (feature_type === 'PriorLake') {
    collection_name = 'SWOT_L2_HR_LakeSP_D'
  }

  params = {
    feature: feature_type,
    feature_id,
    start_time,
    end_time,
    output,
    fields,
    // https://podaac.github.io/hydrocron/timeseries.html#compact-string-required-no
    compact: 'true',
    // https://podaac.github.io/hydrocron/timeseries.html#collection-name-string-required-no
    collection_name
  }

  // Use our API proxy URL instead of the direct HydroCron URL
  // This is due to CORS issues with the HydroCron server
  // https://github.com/podaac/hydrocron/issues/306
  let response = await fetchHydroCronData(ENDPOINTS.hydrocron, params, swordFeature)
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

  // create a hash based on this unique url and params, to use as the key in local storage
  // we must remove the "end_time" parameter from the hash, as it will change with each request
  let paramsStringWithoutEndTime = { ...params }
  delete paramsStringWithoutEndTime.end_time
  let hash = `${url}?${JSON.stringify(paramsStringWithoutEndTime)}`.hashCode()

  let paramString = Object.keys(params)
    .map((key) => key + '=' + params[key])
    .join('&')
  let query = `${url}?${paramString}`
  try {
    // first check local storage for the query
    let data = localStorage.getItem(hash) || null
    if (!data || new Date() - new Date(JSON.parse(data).cached_at) > MS_TO_KEEP_CACHE) {
      let response = await fetch(query, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.status < 500) {
        if (response.status == 400) {
          let text = 'No data found for: '
          if (params.feature && params.feature_id) {
            text += `${params.feature} ${params.feature_id}`
          } else {
            text += JSON.stringify(params)
          }
          alertStore.displayAlert({
            title: 'No data found',
            text,
            type: 'warning',
            closable: true,
            duration: 3
          })
          return null
        }
      } else {
        let text = 'Error while fetching SWOT data: '
        if (response.statusText) {
          text += response.statusText
        } else {
          text += 'Unknown error'
        }
        alertStore.displayAlert({
          title: 'Error fetching SWOT data',
          text,
          type: 'error',
          closable: true,
          duration: 3
        })
        return null
      }
      data = await response.json()
      data.cached_at = new Date().toISOString()
      try {
        localStorage.setItem(hash, JSON.stringify(data))
      } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          console.warn('LocalStorage quota exceeded. Clearing storage and retrying...')
          localStorage.clear()
          localStorage.setItem(hash, JSON.stringify(data))
        } else {
          throw e
        }
      }
    } else {
      data = JSON.parse(data)
    }
    const processedResult = await processHydroCronResult(data, params, swordFeature)
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

const processHydroCronResult = async (data, params, swordFeature) => {
  // TODO check the content type and handle it
  // application/json
  // console.log(response.headers.get('Content-Type'))
  const alertStore = useAlertStore()
  // https://podaac.github.io/hydrocron/timeseries.html#response-codes
  if (data.hits == undefined || data.hits < 1) {
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
  // check if the feature already has queries
  if (swordFeature.queries === undefined) {
    swordFeature.queries = []
  }
  swordFeature.queries.push(data)
  return data
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

async function modifyDateTimeStringForExcel(csvData) {
  // Modify the time_str format for excel compatibility
  // Excel doesn’t natively recognize the ISO 8601 datetime format
  // So we convert to yyyy-MM-dd HH:mm:ss
  csvData = csvData.replace(/T/g, ' ')
  csvData = csvData.replace(/Z/g, '')
  return csvData
}

async function downloadMultiNodesCsv(nodes = []) {
  if (nodes.length === 0) {
    nodes = useFeaturesStore().nodes
  }
  const csvData = await Promise.all(
    nodes.map(async (node, index) => {
      let csv = await queryHydroCron(node, 'csv')
      // strip the header from all but the first node
      if (index !== 0) {
        return csv.split('\n').slice(1).join('\n')
      }
      csv = await modifyDateTimeStringForExcel(csv)
      return csv
    })
  )
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
  let csvData = await queryHydroCron(feature, 'csv')
  csvData = await modifyDateTimeStringForExcel(csvData)
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
    where: `reach_id=${reachFeature.properties.reach_id}`,
    outFields: '*'
  }
  let paramString = Object.keys(params)
    .map((key) => key + '=' + params[key])
    .join('&')
  let query = `${url}?${paramString}`
  let data = localStorage.getItem(query) || null
  if (!data) {
    const response = await fetch(query)
    data = await response.json()
    data.cached_at = new Date().toISOString()
    try {
      localStorage.setItem(query, JSON.stringify(data))
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn('LocalStorage quota exceeded. Clearing storage and retrying...')
        localStorage.clear()
        localStorage.setItem(query, JSON.stringify(data))
      } else {
        throw e
      }
    }
  } else {
    data = JSON.parse(data)
  }
  // SWORD Nodes have attributes, insteady of properties. For consistency, we rename attributes to properties
  data.features.forEach((node) => {
    Object.defineProperty(node, 'properties', Object.getOwnPropertyDescriptor(node, 'attributes'))
    delete node.attributes
  })
  return data.features
}

async function getNodeDataForReach(reachFeature) {
  let nodes = await getNodesFromReach(reachFeature)
  reachFeature.nodes = nodes
  await getDataForNodes(nodes)
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
