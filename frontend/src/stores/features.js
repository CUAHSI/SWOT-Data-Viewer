import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useMapStore } from '@/stores/map'
import { useChartsStore } from '@/stores/charts'
import { useAlertStore } from './alerts'
import { useRouter } from 'vue-router'

export const useFeaturesStore = defineStore('features', () => {
  const selectedFeatures = ref([])
  const activeFeature = ref(null)
  const nodes = ref([])
  // set the mintime to date of first data, 2023-03-29, relative to ECMAScript epoch in decimal seconds
  const minTime = new Date('2023-03-29').getTime() / 1000
  // set the maxtime to today in decimal seconds
  const maxTime = Date.now() / 1000

  const oneMonthAgoInSeconds = new Date().getTime() / 1000 - 30 * 24 * 60 * 60
  const initialTimeRange = [oneMonthAgoInSeconds, maxTime]
  const timeRange = ref(initialTimeRange)
  const querying = ref({ hydrocron: false, nodes: false })

  const mapStore = useMapStore()
  const chartStore = useChartsStore()
  const alertStore = useAlertStore()
  const router = useRouter()

  function resetTimeRange() {
    timeRange.value = initialTimeRange
    chartStore.filterDatasetsToTimeRange()
  }

  function selectFeature(feature) {
    mapStore.selectFeature(feature)
    this.selectedFeatures.push(feature)
    this.activeFeature = feature
    console.log('Feature selected: ', feature)
  }

  function deselectFeature(feature) {
    mapStore.deselectFeature(feature)
    this.selectedFeatures = this.selectedFeatures.filter((f) => f.id !== feature.id)
    if (this.activeFeature.id === feature.id) {
      this.activeFeature = null
    }
    console.log('Feature deselected: ', feature)
  }

  function mergeFeature(feature) {
    console.log('Merging feature', feature)
    const index = selectedFeatures.value.findIndex((f) => f.id === feature.id)
    if (index !== -1) {
      console.log('Feature already exists in selected features')
      selectedFeatures.value[index] = feature
    } else {
      console.log('Feature does not exist in selected features')
      selectedFeatures.value.push(feature)
    }
    this.activeFeature = feature
  }

  const clearSelectedFeatures = () => {
    for (const feature of selectedFeatures.value) {
      console.log('Deselecting feature', feature)
      mapStore.deselectFeature(feature)
    }
    selectedFeatures.value = []
    activeFeature.value = null
    mapStore.clearAllFeatures()
    chartStore.clearChartData()
  }

  const checkFeatureSelected = (feature) => {
    if (!selectedFeatures.value || !feature) return false
    return selectedFeatures.value.some((f) => f?.id === feature.id)
  }

  const getFeatureName = (feature = null) => {
    if (feature == null) {
      feature = activeFeature.value
    }
    if (!feature) return ''
    const river_name = feature.properties.river_name
    if (river_name === 'NODATA') {
      return 'UNNAMED RIVER'
    }
    return river_name
  }

  const setActiveFeatureByReachId = (reachId) => {
    // https://developers.arcgis.com/esri-leaflet/samples/querying-feature-layers-1/
    let features = []
    let query = mapStore.mapObject.reachesFeatures.query().where('reach_id = ' + reachId)
    // it doesn't seem that this query.run is awaitable
    query.run(
      function(error, featureCollection){
        let message = ''
        if (error) {
          message = `Error querying features: ${error}`
        }
        if (!featureCollection || !featureCollection?.features?.length > 0) {
          message = 'No features found matching reach ID'
        }
        if (message) {
          alertStore.displayAlert({
            title: 'Error Getting Feature by Reach ID',
            text: message,
            type: 'error',
            closable: true,
            duration: 6
          })
          router.push('/map')
          return
        }
        features = featureCollection.features
        let feature = features[0]
        selectedFeatures.value.push(feature)
        activeFeature.value = feature
      }
    )
  }

  return {
    selectedFeatures,
    selectFeature,
    activeFeature,
    clearSelectedFeatures,
    deselectFeature,
    checkFeatureSelected,
    mergeFeature,
    nodes,
    getFeatureName,
    setActiveFeatureByReachId,
    timeRange,
    resetTimeRange,
    minTime,
    maxTime,
    querying
  }
},
{ persist: true }
)
