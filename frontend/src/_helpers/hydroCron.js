import { APP_API_URL } from '@/constants'
import { useFeaturesStore } from '@/stores/features'
import { useAlertStore } from '@/stores/alerts'
import { buildFakeData, knownQueriesWithData } from '@/_helpers/fakeData'

const queryHydroCron = async (swordFeature = null) => {
  const featuresStore = useFeaturesStore()
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
  console.log('swordFeature', swordFeature)
  let params = {}
  if (!featuresStore.shouldFakeData) {
    // TODO: get the feature type dynamically
    // get the start and end time from the date range
    // get the fields from the selected fields
    params = {
      feature: 'Reach',
      feature_id: swordFeature.properties.reach_id,
      start_time: '2023-06-01T00:00:00Z',
      end_time: '2023-10-30T00:00:00Z',
      output: 'geojson',
      fields: 'feature_id,time_str,wse'
    }
  } else {
    // Build fake data
    // get a random known query from the knownQueriesWithData array
    params = knownQueriesWithData[Math.floor(Math.random() * knownQueriesWithData.length)]
    console.log('fake params', params)
  }
  let json = await fetchHydroCronData(url, params, swordFeature)
  if (json == null) {
    return
  }
  if (featuresStore.shouldFakeData) {
    let fakeData = buildFakeData([...featuresStore.selectedFeatures, json])
    // update the visData before selecting the feature otherwise it will show blank
    featuresStore.visData = fakeData
    console.log('fakeData', fakeData)
  }
  featuresStore.selectFeature(json)
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
    let json = await result.json()
    json.params = params
    json.sword = swordFeature.properties
    console.log('query', query)
    console.log(result)
    console.log('json', json)
    let features = json.results.geojson.features
    if (features.length > 0) {
      return json
    }else{
      alertStore.displayAlert({
        title: 'No data found',
        text: `No data found for: ${JSON.stringify(params)}`,
        type: 'warning',
        closable: true,
        duration: 10
      })
      return null
    }
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

export { queryHydroCron }
