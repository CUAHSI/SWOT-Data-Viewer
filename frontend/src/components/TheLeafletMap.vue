<template>
  <div v-show="$route.meta.showMap" id="mapContainer"></div>
  <v-card
    v-if="$route.meta.showMap && zoom < minReachSelectionZoom"
    id="zoomIndicator"
    color="info"
    density="compact"
    dense
  >
    <v-card-text> <v-icon :icon="mdiMagnifyPlus"></v-icon> Zoom in to select reaches </v-card-text>
  </v-card>
  <v-card v-if="$route.meta.showMap" id="mouseposition" color="info">
    <v-card-text>
      <v-icon :icon="mdiCrosshairsGps"></v-icon> {{ center.lat?.toFixed(5) }},
      {{ center.lng?.toFixed(5) }} <br />
    </v-card-text>
  </v-card>
</template>

<script setup>
import 'leaflet/dist/leaflet.css'
import 'leaflet-easybutton/src/easy-button.css'
import L, { canvas } from 'leaflet'
import * as esriLeaflet from 'esri-leaflet'
import * as esriLeafletGeocoder from 'esri-leaflet-geocoder'
// import * as esriLeafletVector from 'esri-leaflet-vector';
import 'leaflet-easybutton/src/easy-button'
import { onMounted, onUpdated, ref } from 'vue'
import { useMapStore } from '@/stores/map'
import { useAlertStore } from '@/stores/alerts'
import { useFeaturesStore } from '@/stores/features'
import { useChartsStore } from '@/stores/charts'
import { mdiMagnifyPlus, mdiCrosshairsGps } from '@mdi/js'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const mapStore = useMapStore()
const alertStore = useAlertStore()
const featureStore = useFeaturesStore()
const chartStore = useChartsStore()

const router = useRouter()

const { mapObject, zoom, center } = storeToRefs(mapStore)
const { activeFeature } = storeToRefs(featureStore)
const minReachSelectionZoom = 7
const accessToken =
  'AAPK7e5916c7ccc04c6aa3a1d0f0d85f8c3brwA96qnn6jQdX3MT1dt_4x1VNVoN8ogd38G2LGBLLYaXk7cZ3YzE_lcY-evhoeGX'

onUpdated(async () => {
  if (router?.currentRoute?.value.meta.showMap) {
    mapObject.value.leaflet.invalidateSize()
    if (activeFeature.value) {
      mapStore.selectFeature(activeFeature.value)
      // zoom to the active feature
      // mapObject.value.leaflet.fitBounds(activeFeature.value.getBounds())
    }
  }
})

onMounted(async () => {
  await router.isReady()
  const currentRoute = router.currentRoute.value
  console.log('Map mounted', currentRoute)
  mapStore.checkQueryParams(currentRoute)
  let leaflet = L.map('mapContainer').setView(center.value, zoom.value)
  // prevent panning outside of the single world bounds
  leaflet.setMaxBounds([
    [-90, -180],
    [90, 180]
  ])
  mapObject.value.leaflet = leaflet
  mapObject.value.hucbounds = []
  mapObject.value.popups = []
  mapObject.value.buffer = 20
  mapObject.value.huclayers = []
  mapObject.value.reaches = {}
  mapObject.value.reachesFeatures = ref({})

  mapObject.value.bbox = [99999999, 99999999, -99999999, -99999999]
  //Remove the common zoom control and add it back later later
  leaflet.zoomControl.remove()

  // Initial OSM tile layer
  const CartoDB = L.tileLayer(
    'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }
  )

  var CartoDB_PositronNoLabels = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }
  )

  var CartoDB_DarkMatterNoLabels = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }
  )

  const baselayers = {
    CartoDB,
    CartoDB_PositronNoLabels,
    CartoDB_DarkMatterNoLabels
  }

  CartoDB.addTo(leaflet)

  leaflet.on('moveend zoomend', function (e) {
    let centerObj = e.target.getCenter()
    center.value = {
      lat: centerObj.lat,
      lng: centerObj.lng
    }
    zoom.value = e.target._zoom
    // mapStore.updateRouteAfterMapChange()
  })

  // add lakes features layer to map
  let url = 'https://arcgis.cuahsi.org/arcgis/rest/services/SWOT/world_swot_lakes/FeatureServer/0'
  const lakesFeatures = esriLeaflet
    .featureLayer({
      url: url,
      simplifyFactor: 0.35,
      precision: 5,
      minZoom: 9,
      maxZoom: 18,
      style: function () {
        return {
          weight: 0, // remove border
          fillOpacity: 0.7,
          fill: true
        }
      }
      // fields: ["FID", "ZIP", "PO_NAME"],
    })
    .addTo(leaflet)

  lakesFeatures.on('click', function (e) {
    console.log(e.layer.feature.properties)
    const popup = L.popup()
    const content = `
        <h3>${e.layer.feature.properties.names}</h3>
        <h4>Lake ID: ${e.layer.feature.properties.lake_id}</h4>
        <p>
            <ul>
                <li>SWORD Max Area: ${e.layer.feature.properties.max_area}</li>
                <li>SWORD Basin: ${e.layer.feature.properties.basin_id}</li>
            </ul>
        </p>
        <p>
            <a href="https://arcgis.cuahsi.org/arcgis/rest/services/SWOT/world_swot_lakes/FeatureServer/0/${e.layer.feature.id}" target="_blank">View in ArcGIS</a>
        </p>
        <h5>
            More lake data coming soon...
        </h5>
        `
    popup.setLatLng(e.latlng).setContent(content).openOn(leaflet)

    lakesFeatures.setFeatureStyle(e.layer.feature.id, {
      color: '#9D78D2'
    })

    popup.on('remove', function () {
      lakesFeatures.setFeatureStyle(e.layer.feature.id, {
        color: '#3388ff'
      })
    })
  })

  url = 'https://arcgis.cuahsi.org/arcgis/services/SWOT/world_swot_lakes/MapServer/WmsServer?'
  L.tileLayer
    .wms(url, {
      layers: 0,
      transparent: 'true',
      format: 'image/png',
      minZoom: 0,
      maxZoom: 9
    })
    .addTo(leaflet)

  url =
    'https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Esri_Hydro_Reference_Overlay/MapServer'
  // url = 'https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Esri_Hydro_Reference_Labels/MapServer'

  let hydro = esriLeaflet.tiledMapLayer({
    url: url,
    layers: 0,
    transparent: 'true',
    format: 'image/png'
  })

  // add reaches layer to map
  url =
    'https://arcgis.cuahsi.org/arcgis/services/SWOT/world_SWORD_reaches_mercator/MapServer/WMSServer?'
  L.tileLayer
    .wms(url, {
      layers: 0,
      transparent: 'true',
      format: 'image/png',
      minZoom: 0,
      maxZoom: minReachSelectionZoom - 1
    })
    .addTo(leaflet)

  url =
    'https://arcgis.cuahsi.org/arcgis/rest/services/SWOT/world_SWORD_reaches_mercator/FeatureServer/0'
  const reachesFeatures = esriLeaflet
    .featureLayer({
      url: url,
      renderer: canvas({ tolerance: 5 }),
      simplifyFactor: 0.35,
      precision: 5,
      minZoom: minReachSelectionZoom,
      maxZoom: 18,
      color: mapStore.featureOptions.defaultColor,
      weight: mapStore.featureOptions.defaultWeight,
      opacity: mapStore.featureOptions.opacity
      // fields: ["FID", "ZIP", "PO_NAME"],
    })
    .addTo(leaflet)

  mapObject.value.reachesFeatures = reachesFeatures

  reachesFeatures.on('click', async function (e) {
    const feature = e.layer.feature
    featureStore.clearSelectedFeatures()
    if (!featureStore.checkFeatureSelected(feature)) {
      // Only allow one feature to be selected at a time
      featureStore.selectFeature(feature)
    }
  })

  // add nodes layer to map
  url =
    'https://arcgis.cuahsi.org/arcgis/services/SWOT/world_SWORD_nodes_mercator/MapServer/WMSServer?'
  L.tileLayer.wms(url, {
    layers: 0,
    transparent: 'true',
    format: 'image/png',
    minZoom: 12,
    maxZoom: 13
  })

  url =
    'https://arcgis.cuahsi.org/arcgis/rest/services/SWOT/world_SWORD_nodes_mercator/FeatureServer/0'
  const nodesFeatures = esriLeaflet.featureLayer({
    url: url,
    simplifyFactor: 0.35,
    precision: 5,
    minZoom: 13,
    maxZoom: 18
  })

  nodesFeatures.on('click', function (e) {
    const popup = L.popup()
    console.log('Selected node:', e.layer.feature.properties)
    const content = `
        <h3>${e.layer.feature.properties.river_name}</h3>
        <h4>Node ID: ${e.layer.feature.properties.node_id}</h4>
        <p>
            <ul>
                <li>SWORD Width: ${e.layer.feature.properties.width}</li>
                <li>SWORD WSE: ${e.layer.feature.properties.wse}</li>
                <li>SWORD Sinuosity: ${e.layer.feature.properties.sinuosity}</li>
                <li>SWOT Dist_out: ${e.layer.feature.properties.dist_out}</li>
            </ul>
        </p>
        `
    popup.setLatLng(e.latlng).setContent(content).openOn(leaflet)
  })

  // add USGS gage layer to map
  url = 'http://arcgis.cuahsi.org/arcgis/services/NHD/usgs_gages/MapServer/WmsServer?'
  let gages = L.tileLayer.wms(url, {
    layers: 0,
    transparent: 'true',
    format: 'image/png',
    minZoom: 9,
    maxZoom: 18
    // BGCOLOR: '#f4d03f',
  })

  // layer toggling
  let mixed = {
    'USGS Gages': gages,
    // "Lakes": lakes,
    Lakes: lakesFeatures,
    // "SWORD Reaches": reaches,
    Reaches: reachesFeatures,
    // "SWORD Nodes": sword_nodes,
    Nodes: nodesFeatures,
    Esri_Hydro_Reference_Overlay: hydro
  }

  // /*
  //  * LEAFLET BUTTONS
  //  */

  // Layer Control
  L.control.layers(baselayers, mixed).addTo(leaflet)

  /*
   * LEAFLET EVENT HANDLERS
   */
  leaflet.on('click', function (e) {
    mapClick(e)
  })

  // validate the map
  validate_bbox_size()

  const swotriverMapServiceProvider = esriLeafletGeocoder.mapServiceProvider({
    label: 'River names',
    url: 'https://arcgis.cuahsi.org/arcgis/rest/services/SWOT/world_SWORD_reaches_mercator/MapServer',
    layers: [0],
    searchFields: ['river_name ']
  })

  const hucMapServiceProvider = esriLeafletGeocoder.mapServiceProvider({
    label: 'HUC 8',
    maxResults: 3,
    url: '	https://arcgis.cuahsi.org/arcgis/rest/services/hucs/HUC_8/MapServer',
    layers: [0],
    searchFields: ['name']
  })

  esriLeafletGeocoder.featureLayerProvider({
    url: 'https://arcgis.cuahsi.org/arcgis/rest/services/hucs/HUC_8/FeatureServer/0',
    searchFields: ['name'],
    label: 'Huc 8',
    //bufferRadius: 5000,
    formatSuggestion: function (feature) {
      return feature.properties.name
    }
  })

  const addressSearchProvider = esriLeafletGeocoder.arcgisOnlineProvider({
    apikey: accessToken,
    maxResults: 3,
    nearby: {
      lat: -33.8688,
      lng: 151.2093
    }
  })
  /**/

  esriLeafletGeocoder
    .geosearch({
      position: 'topleft',
      placeholder: 'Search for a location',
      useMapBounds: false,
      expanded: true,
      title: ' search',

      providers: [swotriverMapServiceProvider, hucMapServiceProvider, addressSearchProvider]
    })
    .addTo(leaflet)

  // add zoom control again they are ordered in the order they are added
  L.control
    .zoom({
      position: 'topleft'
    })
    .addTo(leaflet)

  // Erase
  L.easyButton(
    'fa-eraser',
    function () {
      clearSelection()
    },
    'clear selected features'
  ).addTo(leaflet)
})

// async function getGageInfo(e) {
//   // TESTING GAGE INFO BOX
//   // quick and dirty buffer around cursor
//   // bbox = lon_min, lat_min, lon_max, lat_max
//   let buf = 0.001

//   let buffered_bbox =
//     e.latlng.lat -
//     buf +
//     ',' +
//     (e.latlng.lng - buf) +
//     ',' +
//     (e.latlng.lat + buf) +
//     ',' +
//     (e.latlng.lng + buf)
//   let defaultParameters = {
//     service: 'WFS',
//     request: 'GetFeature',
//     bbox: buffered_bbox,
//     typeName: 'usgs_gages:usgs_gages_4326',
//     SrsName: 'EPSG:4326',
//     outputFormat: 'ESRIGEOJSON'
//   }
//   let root = 'https://arcgis.cuahsi.org/arcgis/services/NHD/usgs_gages/MapServer/WFSServer'
//   let parameters = L.Util.extend(defaultParameters)
//   let gageURL = root + L.Util.getParamString(parameters)

//   let gage_meta = {}
//   console.log(gageURL)
//   let resp = await fetch(gageURL)
//   if (resp.ok) {
//     try {
//       let response = await resp.json()
//       if (response.features.length > 0) {
//         let atts = response.features[0].attributes
//         let geom = response.features[0].geometry
//         gage_meta.name = atts.STATION_NM
//         gage_meta.num = atts.SITE_NO
//         gage_meta.x = geom.x
//         gage_meta.y = geom.y
//       }
//     } catch (e) {
//       console.error('Error attempting json parse', e)
//     }
//   }
//   return gage_meta
// }

/**
 * Handles the click event on the map.
 *
 * @param {MouseEvent} e - The click event object.
 * @returns {Promise<void>} - A promise that resolves when the click event is handled.
 */
async function mapClick() {
  return

  // // exit early if not zoomed in enough.
  // // this ensures that objects are not clicked until zoomed in
  // let zoom = e.target.getZoom()
  // if (zoom < mapObject.value.selectable_zoom) {
  //   return
  // }

  // // check if gage was clicked
  // let gage = await getGageInfo(e)

  // // if a gage was selected, create a pop up and exit early.
  // // we don't want to toggle HUC selection if a gage was clicked
  // if (Object.keys(gage).length > 0) {
  //   // create map info object here

  //   // close all popups
  //   if (mapObject.value.popups.length > 0) {
  //     mapObject.value.leaflet.closePopup()
  //   }

  //   // create new popup containing gage info
  //   L.popup()
  //     .setLatLng([gage.y, gage.x])
  //     .setContent('<b>ID:</b> ' + gage.num + '<br>' + '<b>Name</b>: ' + gage.name + '<br>')
  //     //		             + '<b>Select</b>: <a onClick=traceUpstream("'+gage.num+'")>upstream</a>')
  //     .openOn(mapObject.value.leaflet)

  //   // exit function without toggling HUC
  //   return
  // }
}

function clearSelection() {
  // TODO: update clear selection function
  // Clears the selected features on the map

  for (let key in mapObject.value.hucbounds) {
    // clear the huc boundary list
    delete mapObject.value.hucbounds[key]

    // clear the polygon overlays
    mapObject.value.huclayers[key].clearLayers()
    delete mapObject.value.huclayers[key]

    // clear the hucs in the html template
  }

  featureStore.clearSelectedFeatures()
  chartStore.clearChartData()

  // update the map
  updateMapBBox()

  // clear and update the HUC textbox
  // document.querySelector('.mdl-textfield').MaterialTextfield.change('');
  alertStore.displayAlert({
    title: 'Cleared',
    text: 'Your map selection was cleared',
    type: 'info',
    closable: true,
    duration: 1
  })
}

/**
 * Calculates and draws the bounding box on the map.
 */
function updateMapBBox() {
  // calculate global boundary
  let xmin = 9999999
  let ymin = 9999999
  let xmax = -9999999
  let ymax = -9999999
  for (let key in mapObject.value.hucbounds) {
    let bounds = mapObject.value.hucbounds[key].getBounds()
    if (bounds.getWest() < xmin) {
      xmin = bounds.getWest()
    }
    if (bounds.getSouth() < ymin) {
      ymin = bounds.getSouth()
    }
    if (bounds.getEast() > xmax) {
      xmax = bounds.getEast()
    }
    if (bounds.getNorth() > ymax) {
      ymax = bounds.getNorth()
    }
  }

  // save the map bbox
  mapObject.value.bbox = [xmin, ymin, xmax, ymax]

  removeBbox()

  // redraw the bbox layer with new coordinates
  let coords = [
    [
      [xmin, ymin],
      [xmin, ymax],
      [xmax, ymax],
      [xmax, ymin],
      [xmin, ymin]
    ]
  ]
  let polygon = [
    {
      type: 'Polygon',
      coordinates: coords
    }
  ]

  // todo: add function to validate bbox and return back styling
  // check bbox area bounds
  let bbox = validate_bbox_size()

  let json_polygon = L.geoJSON(polygon, { style: bbox.style })

  // save the layer
  mapObject.value.huclayers['BBOX'] = json_polygon

  return bbox.is_valid
}

function removeBbox() {
  // remove the bbox layer if it exists
  if ('BBOX' in mapObject.value.huclayers) {
    // remove the polygon overlay
    mapObject.value.huclayers['BBOX'].clearLayers()
    delete mapObject.value.huclayers['BBOX']
  }
}

/**
 * Validates that size constraints for the subset bounding box
 * @returns {object} - bounding box style and is_valid flag
 */
function validate_bbox_size() {
  // todo: turn the bounding box red and deactivate the submit button.
  let bbox = mapObject.value.bbox

  let londiff = Math.abs(bbox[2] - bbox[0])
  let latdiff = Math.abs(bbox[3] - bbox[1])

  let sqr_deg = londiff * latdiff

  let valid = true
  if (bbox.includes(99999999) || bbox.includes(-99999999)) {
    valid = false
  }

  let style = {}
  if (sqr_deg < 4 && valid) {
    style = {
      fillColor: 'black',
      weight: 2,
      opacity: 1,
      color: 'green',
      fillOpacity: 0.01,
      lineJoin: 'round'
    }
  } else {
    style = {
      fillColor: 'black',
      weight: 2,
      opacity: 1,
      color: 'red',
      fillOpacity: 0.01,
      lineJoin: 'round'
    }
    valid = false
  }
  mapStore.boxIsValid = valid
  return { style: style, is_valid: valid }
}
</script>
<style scoped>
#mapContainer {
  width: 100%;
  height: 100%;
}

#zoomIndicator {
  position: fixed;
  bottom: 137px;
  left: 10px;
  z-index: 1000;
}

#mouseposition {
  position: absolute;
  bottom: 73px;
  left: 10px;
  padding: 1px;
  z-index: 1000;
}
</style>
