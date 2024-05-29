import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useMapStore } from '@/stores/map'
import { useChartsStore } from '@/stores/charts'

export const useFeaturesStore = defineStore('features', () => {
  const selectedFeatures = ref([])
  const activeFeature = ref(null)
  const nodes = ref([])
  // set the mintime to date of first data, 2023-03-29, relative to ECMAScript epoch in milliseconds
  const minTime = new Date('2023-03-29').toISOString().split("T", 1)[0]
  // set the maxtime to today
  const maxTime = new Date().toISOString().split("T", 1)[0]
  const timeRange = ref([minTime, maxTime])

  const mapStore = useMapStore()
  const chartStore = useChartsStore()

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
    timeRange,
    minTime,
    maxTime
  }
})
