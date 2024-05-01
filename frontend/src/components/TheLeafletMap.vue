<template>
    <div v-show="$route.meta.showMap" id="mapContainer"></div>
</template>

<script setup>
import "leaflet/dist/leaflet.css";
import "leaflet-easybutton/src/easy-button.css";
import L, { canvas } from 'leaflet'
import * as esriLeaflet from "esri-leaflet";
// import * as esriLeafletVector from 'esri-leaflet-vector';
import "leaflet-easybutton/src/easy-button";
import { onMounted, onUpdated, ref } from 'vue'
import { useMapStore } from '@/stores/map'
import { useAlertStore } from '@/stores/alerts'
import { useFeaturesStore } from '@/stores/features'
import { useChartsStore } from '@/stores/charts'

const mapStore = useMapStore()
const alertStore = useAlertStore();
const featureStore = useFeaturesStore();
const chartStore = useChartsStore();

const Map = mapStore.mapObject

onUpdated(() => {
    Map.leaflet.invalidateSize()
})

onMounted(() => {
    let leaflet = L.map('mapContainer').setView([38, -95.9345], 5);
    Map.leaflet = leaflet;
    Map.hucbounds = [];
    Map.popups = [];
    Map.buffer = 20;
    Map.huclayers = [];
    Map.reaches = {};
    Map.reachesFeatures = ref({})

    Map.bbox = [99999999,
        99999999,
        -99999999,
        -99999999];

    // Initial OSM tile layer
    const CartoDB = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 19
    })

    var CartoDB_PositronNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });

    var CartoDB_DarkMatterNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });

    const Stadia_StamenTonerLite = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    });

    const Stadia_StamenTonerBackground = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_background/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    });

    const baselayers = {
        CartoDB,
        CartoDB_PositronNoLabels,
        CartoDB_DarkMatterNoLabels,
        Stadia_StamenTonerLite,
        Stadia_StamenTonerBackground
    };

    CartoDB.addTo(leaflet);


    // add lakes features layer to map
    let url = 'https://arcgis.cuahsi.org/arcgis/rest/services/SWOT/world_swot_lakes/FeatureServer/0'
    const lakesFeatures = esriLeaflet.featureLayer({
        url: url,
        simplifyFactor: 0.35,
        precision: 5,
        minZoom: 9,
        maxZoom: 18,
        // fields: ["FID", "ZIP", "PO_NAME"],
    }).addTo(leaflet);

    lakesFeatures.on("click", function (e) {
        console.log(e.layer.feature.properties)
        const popup = L.popup();
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
        `;
        popup.setLatLng(e.latlng).setContent(content).openOn(leaflet);

        lakesFeatures.setFeatureStyle(e.layer.feature.id, {
            color: "#9D78D2",
            weight: 3,
            opacity: 1
        });
    });

    url = 'https://arcgis.cuahsi.org/arcgis/services/SWOT/world_swot_lakes/MapServer/WmsServer?'
    let lakes = L.tileLayer.wms(url, {
        layers: 0,
        transparent: 'true',
        format: 'image/png',
        minZoom: 0,
        maxZoom: 9,
    }).addTo(leaflet);

    // add reaches layer to map
    url = 'https://arcgis.cuahsi.org/arcgis/services/SWOT/world_SWORD_reaches_mercator/MapServer/WMSServer?'
    let reaches = L.tileLayer.wms(url, {
        layers: 0,
        transparent: 'true',
        format: 'image/png',
        minZoom: 0,
        maxZoom: 7,
    }).addTo(leaflet);
    url = url = 'https://arcgis.cuahsi.org/arcgis/rest/services/SWOT/world_SWORD_reaches_mercator/FeatureServer/0'
    const reachesFeatures = esriLeaflet.featureLayer({
        url: url,
        renderer: canvas({ tolerance: 5 }),
        simplifyFactor: 0.35,
        precision: 5,
        minZoom: 7,
        maxZoom: 18,
        color: mapStore.featureOptions.defaultColor,
        weight: mapStore.featureOptions.weight,
        opacity: mapStore.featureOptions.opacity,
        // fields: ["FID", "ZIP", "PO_NAME"],
    }).addTo(leaflet);

    Map.reachesFeatures = reachesFeatures

    reachesFeatures.on("click", async function (e) {
        const feature = e.layer.feature
        if (featureStore.checkFeatureSelected(feature)) {
            featureStore.deselectFeature(feature)
        } else {
            // Only allow one feature to be selected at a time
            featureStore.clearSelectedFeatures()
            if (feature?.properties) {
                feature.sword = feature.properties
                feature.id = feature.properties.OBJECTID
            }
            featureStore.selectFeature(feature)
        }
    });

    // add nodes layer to map
    url = 'https://arcgis.cuahsi.org/arcgis/services/SWOT/world_SWORD_nodes_mercator/MapServer/WMSServer?'
    let sword_nodes = L.tileLayer.wms(url, {
        layers: 0,
        transparent: 'true',
        format: 'image/png',
        minZoom: 12,
        maxZoom: 13,
    })

    url = 'https://arcgis.cuahsi.org/arcgis/rest/services/SWOT/world_SWORD_nodes_mercator/FeatureServer/0'
    const nodesFeatures = esriLeaflet.featureLayer({
        url: url,
        simplifyFactor: 0.35,
        precision: 5,
        minZoom: 13,
        maxZoom: 18,
    })

    nodesFeatures.on("click", function (e) {
        const popup = L.popup();
        console.log("Selected node:", e.layer.feature.properties)
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
        `;
        popup.setLatLng(e.latlng).setContent(content).openOn(leaflet);
    });

    // // add USGS gage layer to map
    // url = 'http://arcgis.cuahsi.org/arcgis/services/NHD/usgs_gages/MapServer/WmsServer?';
    // let gages = L.tileLayer.wms(url, {
    //     layers: 0,
    //     transparent: 'true',
    //     format: 'image/png',
    //     minZoom: 9,
    //     maxZoom: 18,
    // }).addTo(map);


    // layer toggling
    let mixed = {
        // "USGS Gages": gages,
        // "Lakes": lakes,
        "Lakes": lakesFeatures,
        // "SWORD Reaches": reaches,
        "Reaches": reachesFeatures,
        // "SWORD Nodes": sword_nodes,
        "Nodes": nodesFeatures,
    };

    // /*
    //  * LEAFLET BUTTONS
    //  */

    // Erase
    L.easyButton('fa-eraser',
        function () { clearSelection(); },
        'clear selected features').addTo(leaflet);

    // Layer Control
    L.control.layers(baselayers, mixed).addTo(leaflet);

    /*
     * LEAFLET EVENT HANDLERS
     */
    leaflet.on("click", function (e) {
        mapClick(e);
    });


    // validate the map
    validate_bbox_size()
})


async function getGageInfo(e) {

    // TESTING GAGE INFO BOX
    // quick and dirty buffer around cursor
    // bbox = lon_min, lat_min, lon_max, lat_max
    let buf = 0.001;

    let buffered_bbox = (e.latlng.lat - buf) + ','
        + (e.latlng.lng - buf) + ','
        + (e.latlng.lat + buf) + ','
        + (e.latlng.lng + buf);
    let defaultParameters = {
        service: 'WFS',
        request: 'GetFeature',
        bbox: buffered_bbox,
        typeName: 'usgs_gages:usgs_gages_4326',
        SrsName: 'EPSG:4326',
        outputFormat: 'ESRIGEOJSON'
    };
    let root = 'https://arcgis.cuahsi.org/arcgis/services/NHD/usgs_gages/MapServer/WFSServer';
    let parameters = L.Util.extend(defaultParameters);
    let gageURL = root + L.Util.getParamString(parameters);

    let gage_meta = {};
    console.log(gageURL)
    let resp = await fetch(gageURL)
    if (resp.ok) {
        try {
            let response = await resp.json()
            if (response.features.length > 0) {
                let atts = response.features[0].attributes;
                let geom = response.features[0].geometry;
                gage_meta.name = atts.STATION_NM;
                gage_meta.num = atts.SITE_NO;
                gage_meta.x = geom.x;
                gage_meta.y = geom.y;
            }
        } catch (e) {
            console.error("Error attempting json parse", e)
        }
    }
    return gage_meta;

}

/**
 * Handles the click event on the map.
 *
 * @param {MouseEvent} e - The click event object.
 * @returns {Promise<void>} - A promise that resolves when the click event is handled.
 */
async function mapClick(e) {
    return

    // exit early if not zoomed in enough.
    // this ensures that objects are not clicked until zoomed in
    let zoom = e.target.getZoom();
    if (zoom < Map.selectable_zoom) {
        return
    }


    // check if gage was clicked
    let gage = await getGageInfo(e);

    // if a gage was selected, create a pop up and exit early.
    // we don't want to toggle HUC selection if a gage was clicked
    if (Object.keys(gage).length > 0) {
        // create map info object here

        // close all popups
        if (Map.popups.length > 0) {
            Map.leaflet.closePopup();
        }

        // create new popup containing gage info
        L.popup().setLatLng([gage.y, gage.x])
            .setContent('<b>ID:</b> ' + gage.num + '<br>'
                + '<b>Name</b>: ' + gage.name + '<br>')
            //		             + '<b>Select</b>: <a onClick=traceUpstream("'+gage.num+'")>upstream</a>')
            .openOn(Map.leaflet);

        // exit function without toggling HUC
        return;
    }
}


function traceUpstream(usgs_gage) {

    console.log('traceUpstream --> selected gage = ' + usgs_gage);

    // clear any existing reaches from the map
    if (Map.reaches.obj != null) {
        Map.reaches.obj.clearLayers();
    }

    // query the upstream reaches via NLDI
    $.ajax({
        url: '/nldi-trace',
        type: 'GET',
        contentType: "application/json",
        data: {
            'site_provider': 'nwis',
            'site': usgs_gage
        },
        success: function (response) {


            // add the reaches to the map and replace the global reaches
            // object with the newly selected reaches.
            let reaches = L.geoJSON(response.features, { style: { color: 'green' } });
            Map.reaches.start_id = reaches._leaflet_id;
            Map.reaches.count = response.features.length;
            Map.reaches.obj = reaches;
            reaches.addTo(Map.leaflet);


            // a list to store a single coordinate for each reach
            let centroids = [];


            // generate a list of points for each of the reaches
            response.features.forEach(function (reach) {

                // select the middle geometry feature.
                // This is a hack and should be replaced with something better
                geom_idx = Math.ceil(reach.geometry.coordinates.length / 2);

                geom_coord = reach.geometry.coordinates[geom_idx];
                centroids.push(geom_coord);
            })

            console.log('Number of reaches found = ' + centroids.length);

            // TODO: move this into a function since it's used in several places.
            // query the HUC geometry for each of the reach coordinate points
            // use this data to query ArcGIS WFS for the selected HUC object.
            centroids.forEach(function (coord) {
                let defaultParameters = {
                    service: 'WFS',
                    request: 'GetFeature',
                    bbox: coord[0] + ',' + coord[1] + ',' + coord[0] + ',' + coord[1],
                    typeName: 'HUC_WBD:HUC12_US',
                    SrsName: 'EPSG:4326'
                };
                let root = 'https://arcgis.cuahsi.org/arcgis/services/US_WBD/HUC_WBD/MapServer/WFSServer';
                let parameters = L.Util.extend(defaultParameters);
                let URL = root + L.Util.getParamString(parameters);

                //	   	// load the map and table elements async
                // todo: highlight the unique set of HUCs, do not toggle.
                //	   	toggleHucsAsync(URL, true, null);
            })
        },
        error: function (error) {
            console.log('error querying NLDI upstream: ' + error);
        }
    });
}

function clearSelection() {
    // TODO: update clear selection function
    // Clears the selected features on the map

    for (let key in Map.hucbounds) {

        // clear the huc boundary list
        delete Map.hucbounds[key];

        // clear the polygon overlays
        Map.huclayers[key].clearLayers();
        delete Map.huclayers[key];

        // clear the hucs in the html template

    }

    featureStore.clearSelectedFeatures()
    chartStore.clearChartData()

    // update the map
    updateMapBBox();


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
    let xmin = 9999999;
    let ymin = 9999999;
    let xmax = -9999999;
    let ymax = -9999999;
    for (let key in Map.hucbounds) {
        let bounds = Map.hucbounds[key].getBounds();
        if (bounds.getWest() < xmin) {
            xmin = bounds.getWest();
        }
        if (bounds.getSouth() < ymin) {
            ymin = bounds.getSouth();
        }
        if (bounds.getEast() > xmax) {
            xmax = bounds.getEast();
        }
        if (bounds.getNorth() > ymax) {
            ymax = bounds.getNorth();
        }
    }

    // save the map bbox
    Map.bbox = [xmin, ymin, xmax, ymax];


    removeBbox()

    // redraw the bbox layer with new coordinates
    let coords = [[[xmin, ymin],
    [xmin, ymax],
    [xmax, ymax],
    [xmax, ymin],
    [xmin, ymin]]];
    let polygon = [{
        "type": "Polygon",
        "coordinates": coords
    }];

    // todo: add function to validate bbox and return back styling
    // check bbox area bounds
    let bbox = validate_bbox_size();

    let json_polygon = L.geoJSON(polygon, { style: bbox.style });

    // save the layer
    Map.huclayers['BBOX'] = json_polygon;


    return bbox.is_valid
}

function removeBbox() {
    // remove the bbox layer if it exists
    if ('BBOX' in Map.huclayers) {
        // remove the polygon overlay 
        Map.huclayers['BBOX'].clearLayers();
        delete Map.huclayers['BBOX'];
    }
}


/**
* Validates that size constraints for the subset bounding box
* @returns {object} - bounding box style and is_valid flag
*/
function validate_bbox_size() {

    // todo: turn the bounding box red and deactivate the submit button.
    let bbox = Map.bbox;

    let londiff = Math.abs(bbox[2] - bbox[0]);
    let latdiff = Math.abs(bbox[3] - bbox[1]);

    let sqr_deg = londiff * latdiff;


    let valid = true;
    if ((bbox.includes(99999999) || bbox.includes(-99999999))) {
        valid = false;
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
        };

    } else {

        style = {
            fillColor: 'black',
            weight: 2,
            opacity: 1,
            color: 'red',
            fillOpacity: 0.01,
            lineJoin: 'round'
        };
        valid = false;
    }
    mapStore.boxIsValid = valid;
    return { style: style, is_valid: valid }
}

</script>
<style scoped>
#mapContainer {
    width: 100%;
    height: 100%;
}
</style>