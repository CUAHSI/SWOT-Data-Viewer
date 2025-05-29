import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useMapStore } from '@/stores/map'
import { useChartsStore } from '@/stores/charts'
import { EARLIEST_HYDROCRON_DATETIME } from '../constants'
import { parseISO, getUnixTime } from 'date-fns'
import { useRouter } from 'vue-router'

export const useFeaturesStore = defineStore(
  'features',
  () => {
    const router = useRouter()
    const selectedFeatures = ref([])
    const activeFeature = ref(null)
    const nodes = ref([])

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
      let featureType = feature?.feature_type?.toLowerCase()
      if (!featureType) {
        featureType = determineFeatureType(feature)
      }
      switch (featureType) {
        case 'reach': {
          const river_name = feature.properties.river_name
          if (river_name === 'NODATA') {
            return 'UNNAMED RIVER'
          }
          return river_name
        }
        case 'priorlake':
          if (feature.properties.names) {
            const namesArray = feature.properties.names.split(';').map((name) => name.trim())
            return namesArray[namesArray.length - 1] || 'Unnamed Lake'
          }
          return 'Unnamed Lake'
        default:
          return 'Unknown Feature'
      }
    }

    const determineFeatureType = (feature) => {
      if (!feature || !feature.properties) {
        return null
      }
      const featureType = feature.properties.feature_type
      if (featureType) {
        return featureType
      }
      // check for reach_id property
      if (feature.properties.reach_id) {
        return 'Reach'
      }
      if (feature.properties.lake_id) {
        return 'PriorLake'
      }
      return null
    }

    const setActiveFeatureById = (featureId) => {
      console.log('Setting active feature by ID:', featureId)
      // check the length of the featureId
      // priorLake will be 10 digits
      // reach will be 11 digits
      // node will be 12 digits
      // CBBBBBRRRRNNNT node
      // CBBBBBRRRRT reach
      // http://gaia.geosci.unc.edu/SWORD/SWORD_ProductDescription_v16.pdf
      const length = featureId.toString().length
      let features = []
      let query = null
      switch (length) {
        case 10: // priorLake
          // generate the lakesFeatures layer if it doesn't exist
          mapStore.generateLakesFeatures()
          // https://developers.arcgis.com/esri-leaflet/samples/querying-feature-layers-1/
          query = mapStore.lakesFeatures.query().where('lake_id = ' + featureId)
          break
        case 11: // reach
          mapStore.generateReachesFeatures()
          query = mapStore.reachesFeatures.query().where('reach_id = ' + featureId)
          break
        case 12: // node
          console.warn('Node features are not yet supported')
          break
        default:
          console.warn('Unknown feature ID length:', length)
          return
      }
      if (!query) {
        console.warn('No query generated for feature ID:', featureId)
        return
      }
      // it doesn't seem that this query.run is awaitable
      query.run(function (error, featureCollection) {
        if (error) {
          console.error('Error querying feature layer:', error)
          return
        }
        if (!featureCollection || !featureCollection.features) {
          console.warn('No features found for ID:', featureId)
          return
        }
        features = featureCollection.features
        if (features.length === 0) {
          console.warn('No features found for ID:', featureId)
          return
        }
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
            setActiveFeatureById(parsedActiveReachId)
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
      setActiveFeatureById,
      timeRange,
      resetTimeRange,
      minTime,
      maxTime,
      querying,
      checkQueryParams,
      determineFeatureType
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
