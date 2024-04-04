import { APP_API_URL } from '@/constants'
import { useFeaturesStore } from '@/stores/features'
import { useAlertStore } from '@/stores/alerts'
import { useHydrologicStore } from '@/stores/hydrologic'
import { useVisStore } from '@/stores/vis'
import { buildFakeData, knownQueriesWithData } from '@/_helpers/fakeData'

const queryHydroCron = async (swordFeature = null, output = 'geojson') => {
  const featuresStore = useFeaturesStore()
  const visStore = useVisStore()
  const hydrologicStore = useHydrologicStore()
  const alertStore = useAlertStore()
  const url = `${APP_API_URL}/hydrocron/v1/timeseries`
  // const url = 'https://soto.podaac.uat.earthdatacloud.nasa.gov/hydrocron/v1/timeseries'

  // TODO: need to get the reach_id from the feature properties
  // for now, just hardcoding it with a reach that has known data in the beta prevalidated data
  // '?feature=Reach&feature_id=72390300011&start_time=2023-06-01T00:00:00Z&end_time=2023-10-30T00:00:00Z&output=geojson&fields=reach_id,time_str,wse,geometry'
  // 'http://localhost:9000/2015-03-31/functions/function/invocations'
  if (swordFeature == null && !featuresStore.shouldFakeData) {
    console.error('No hydroCron query params, and shouldFakeData is false')
    return
  }
  console.log('Querying HydroCron for swordFeature', swordFeature)
  let params = {}

  let fields = hydrologicStore.selectedVariables.map((variable) => variable.abbreviation).join(',')
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

    params = {
      feature: 'Reach',
      feature_id: swordFeature.properties.reach_id,
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
  if (featuresStore.shouldFakeData) {
    let fakeData = buildFakeData([...featuresStore.selectedFeatures, response])
    // update the chartData before selecting the feature otherwise it will show blank
    visStore.chartData = fakeData
    console.log('Fake data', fakeData)
  }else{

    visStore.buildVis([...featuresStore.selectedFeatures, response])
  }
  featuresStore.selectFeature(response)
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
    if (swordFeature?.properties){
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

export { queryHydroCron }
