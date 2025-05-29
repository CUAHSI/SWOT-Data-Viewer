import { defineStore } from 'pinia'
import { ref, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'

export const useMapStore = defineStore('map', () => {
  const mapObject = ref(new Map())
  const router = useRouter()
  const featureOptions = ref({
    selectedColor: 'red',
    defaultColor: 'blue',
    defaultWeight: 2,
    selectedWeight: 5,
    opacity: 0.7
  })
  const mapInitialZoom = 3
  const mapInitialCenter = { lat: 0, lng: 0 }
  const zoom = ref(mapInitialZoom)
  const center = ref(mapInitialCenter)
  const baselayers = shallowRef({})
  const activeBaseLayerName = ref('')
  const activeOverlays = ref(['Lakes', 'Reaches'])
  const overlays = shallowRef({})

  const deselectFeature = (feature) => {
    try {
      const config = {
        color: featureOptions.value.defaultColor,
        weight: featureOptions.value.defaultWeight
      }
      if (feature.feature_type.toLowerCase() === 'reach') {
        mapObject.value.reachesFeatures.setFeatureStyle(feature.id, config)
      } else if (feature.feature_type.toLowerCase() === 'priorlake') {
        mapObject.value.lakesFeatures.setFeatureStyle(feature.id, config)
      } else {
        console.warn('Unknown feature type:', feature.feature_type)
      }
    } catch (error) {
      console.warn('Attempted to deselect feature:', error)
    }
  }

  const selectFeature = (feature) => {
    try {
      const config = {
        color: featureOptions.value.selectedColor,
        weight: featureOptions.value.selectedWeight
      }
      if (feature.feature_type.toLowerCase() === 'reach') {
        mapObject.value.reachesFeatures.setFeatureStyle(feature.id, config)
      } else if (feature.feature_type.toLowerCase() === 'priorlake') {
        mapObject.value.lakesFeatures.setFeatureStyle(feature.id, config)
      } else {
        console.warn('Unknown feature type:', feature.feature_type)
      }
    } catch (error) {
      console.warn('Attempted to select feature:', error)
    }
  }

  const clearAllFeatures = () => {
    const config = { color: featureOptions.value.defaultColor }
    mapObject.value.reachesFeatures.eachFeature(function (feature) {
      feature.setStyle(config)
    })
    mapObject.value.lakesFeatures.eachFeature(function (feature) {
      feature.setStyle(config)
    })
  }

  const updateRouteAfterMapChange = async () => {
    const query = {
      center: JSON.stringify(center.value),
      zoom: zoom.value,
      activeBaseLayerName: activeBaseLayerName.value,
      activeOverlays: JSON.stringify(activeOverlays.value)
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
    if (query.center) {
      let parsedCenter
      try {
        parsedCenter = JSON.parse(query.center)
        if (
          parsedCenter &&
          typeof parsedCenter.lat === 'number' &&
          typeof parsedCenter.lng === 'number' &&
          parsedCenter.lat >= -90 &&
          parsedCenter.lat <= 90 &&
          parsedCenter.lng >= -180 &&
          parsedCenter.lng <= 180
        ) {
          center.value = parsedCenter
        } else {
          center.value = mapInitialCenter
          console.warn('Invalid center format in query:', parsedCenter)
        }
      } catch (e) {
        center.value = mapInitialCenter
        console.warn('Failed to parse center from query:', e)
      }
    }
    if (query.zoom) {
      console.log('Zoom from query:', query.zoom)
      const zoomNum = Number(query.zoom)
      if (
        Number.isInteger(zoomNum) &&
        zoomNum >= 0 &&
        zoomNum <= 22 // Leaflet's typical zoom range
      ) {
        zoom.value = zoomNum
      } else {
        zoom.value = mapInitialZoom
        console.warn('Invalid zoom value in query:', query.zoom)
      }
    }
    if (query.activeBaseLayerName) {
      const baselayerName = query.activeBaseLayerName
      if (baselayers.value[baselayerName]) {
        activeBaseLayerName.value = baselayerName
      } else {
        activeBaseLayerName.value = ''
        activeBaseLayerName.value = baselayers.value[0]?.name || ''
        console.warn('Invalid base layer name in query:', baselayerName)
      }
    } else {
      activeBaseLayerName.value = baselayers.value[0]?.name || ''
    }
    if (query.activeOverlays) {
      let parsedOverlays
      try {
        parsedOverlays = JSON.parse(query.activeOverlays)
        if (Array.isArray(parsedOverlays)) {
          // filter the parsed overlays, ensuring they are present in the overlays object
          const validOverlays = parsedOverlays.filter((overlay) => {
            return overlays.value[overlay] !== undefined
          })
          if (validOverlays) {
            activeOverlays.value = validOverlays
          } else {
            console.warn('No valid overlays in query:', parsedOverlays)
          }
        } else {
          console.warn('Invalid overlays format in query:', parsedOverlays)
        }
      } catch (e) {
        console.warn('Failed to parse overlays from query:', e)
      }
    }
    updateRouteAfterMapChange()

    watch(center, () => {
      updateRouteAfterMapChange()
    })
    watch(zoom, () => {
      updateRouteAfterMapChange()
    })
    watch(activeBaseLayerName, () => {
      updateRouteAfterMapChange()
    })
    watch(activeOverlays, () => {
      updateRouteAfterMapChange()
    })
  }

  return {
    mapObject,
    deselectFeature,
    selectFeature,
    clearAllFeatures,
    checkQueryParams,
    updateRouteAfterMapChange,
    featureOptions,
    zoom,
    center,
    baselayers,
    activeBaseLayerName,
    activeOverlays,
    overlays
  }
})
