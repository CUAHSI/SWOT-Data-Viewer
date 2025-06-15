import { defineStore } from 'pinia'
import { ref, shallowRef, watch } from 'vue'
import { useMapStore } from '@/stores/map'
import { useChartsStore } from '@/stores/charts'
import { EARLIEST_HYDROCRON_DATETIME } from '../constants'
import { parseISO, getUnixTime } from 'date-fns'
import { useRouter } from 'vue-router'
import { canvas } from 'leaflet'
import * as esriLeaflet from 'esri-leaflet'

export const useFeaturesStore = defineStore(
  'features',
  () => {
    const router = useRouter()
    const selectedFeatures = ref([])
    const activeFeature = ref(null)
    const nodes = ref([])
    const reachesFeatures = shallowRef(null)
    const minReachSelectionZoom = ref(7)

    // set the mintime to date of first data relative to ECMAScript epoch in decimal seconds
    const minTime = getUnixTime(parseISO(EARLIEST_HYDROCRON_DATETIME))

    // set the maxtime to today in decimal seconds
    const maxTime = Date.now() / 1000

    const threeMonthAgoInSeconds = new Date().getTime() / 1000 - 3 * 30 * 24 * 60 * 60
    const initialTimeRange = [threeMonthAgoInSeconds, maxTime]
    const timeRange = ref(initialTimeRange)
    const querying = ref({ hydrocron: false, nodes: false })

    const mapStore = useMapStore()
    const chartStore = useChartsStore()

    function resetTimeRange() {
      timeRange.value = initialTimeRange
      chartStore.filterDatasetsToTimeRange()
    }

    function selectFeature(feature) {
      mapStore.selectFeature(feature)
      selectedFeatures.value.push(feature)
      activeFeature.value = feature
    }

    function deselectFeature(feature) {
      mapStore.deselectFeature(feature)
      selectedFeatures.value = selectedFeatures.value.filter((f) => f.id !== feature.id)
      if (activeFeature.value.id === feature.id) {
        activeFeature.value = null
      }
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
      activeFeature.value = feature
    }

    const clearSelectedFeatures = () => {
      for (const feature of selectedFeatures.value) {
        mapStore.deselectFeature(feature)
      }
      selectedFeatures.value = []
      activeFeature.value = null
      mapStore.clearAllFeatures()
      chartStore.clearChartData()
    }

    const checkFeatureSelected = (feature) => {
      return selectedFeatures.value.some((f) => f.id === feature.id)
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
      let query = reachesFeatures.value.query().where('reach_id = ' + reachId)
      // it doesn't seem that this query.run is awaitable
      query.run(function (error, featureCollection) {
        if (error) {
          console.error('Error querying feature layer:', error)
          return
        }
        features = featureCollection.features
        let feature = features[0]
        clearSelectedFeatures()
        selectFeature(feature)
      })
    }

    const updateRouteAfterFeatureChange = async () => {
      const query = {
        activeReachId: activeFeature.value?.properties?.reach_id
      }
      // Merge with existing query, replacing only activeReachId
      const currentQuery = { ...router.currentRoute.value.query }
      const mergedQuery = { ...currentQuery, ...query }
      await router.replace({ query: mergedQuery })
    }

    const checkQueryParams = (to) => {
      let query = to.query
      if (!query) {
        query = router.currentRoute.value.query
      }
      if (query.activeReachId) {
        let parsedActiveReachId
        try {
          parsedActiveReachId = parseInt(query.activeReachId)
          if (parsedActiveReachId) {
            setActiveFeatureByReachId(parsedActiveReachId)
          }
        } catch (error) {
          console.warn('Error parsing activeReachId:', error)
        }
      }
      updateRouteAfterFeatureChange()

      watch(activeFeature, () => {
        updateRouteAfterFeatureChange()
      })
    }

    const createReachesFeatureLayer = () => {
      if (reachesFeatures.value) {
        return
      }
      const url =
        'https://arcgis.cuahsi.org/arcgis/rest/services/SWOT/world_SWORD_reaches_mercator/FeatureServer/0'
      reachesFeatures.value = esriLeaflet.featureLayer({
        url: url,
        renderer: canvas({ tolerance: 5 }),
        simplifyFactor: 0.35,
        precision: 5,
        minZoom: minReachSelectionZoom.value,
        maxZoom: 18,
        color: mapStore.featureOptions.defaultColor,
        weight: mapStore.featureOptions.defaultWeight,
        opacity: mapStore.featureOptions.opacity
        // fields: ["FID", "ZIP", "PO_NAME"],
      })
      console.log('Reaches feature layer created:', reachesFeatures.value)
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
      querying,
      checkQueryParams,
      minReachSelectionZoom,
      createReachesFeatureLayer,
      reachesFeatures
    }
  },
  {
    // persist: {
    //   // only persist the timeRange
    //   // https://prazdevs.github.io/pinia-plugin-persistedstate/guide/config.html#pick
    //   pick: ['timeRange'],
    // }
  }
)
