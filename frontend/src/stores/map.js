import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
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

  const deselectFeature = (feature) => {
    try {
      mapObject.value.reachesFeatures.setFeatureStyle(feature.id, {
        color: featureOptions.value.defaultColor,
        weight: featureOptions.value.defaultWeight
      })
    } catch (error) {
      console.warn('Attempted to deselect feature:', error)
    }
  }

  const selectFeature = (feature) => {
    try {
      mapObject.value.reachesFeatures.setFeatureStyle(feature.id, {
        color: featureOptions.value.selectedColor,
        weight: featureOptions.value.selectedWeight
      })
    } catch (error) {
      console.warn('Attempted to select feature:', error)
    }
  }

  const clearAllFeatures = () => {
    mapObject.value.reachesFeatures.eachFeature(function (feature) {
      feature.setStyle({ color: featureOptions.value.defaultColor })
    })
  }

  const updateRouteAfterMapChange = async () => {
    const query = {
      center: JSON.stringify(center.value),
      zoom: zoom.value
    }
    await router.push({
      query
    })
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
    updateRouteAfterMapChange()

    watch(center, () => {
      updateRouteAfterMapChange()
    })
    watch(zoom, () => {
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
    center
  }
})
