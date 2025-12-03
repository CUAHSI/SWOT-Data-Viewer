import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'

export const useHydrologicStore = defineStore('hydrologic', () => {
  // https://archive.podaac.earthdata.nasa.gov/podaac-ops-cumulus-docs/web-misc/swot_mission_docs/pdd/D-56413_SWOT_Product_Description_L2_HR_RiverSP_20200825a.pdf
  // https://archive.podaac.earthdata.nasa.gov/podaac-ops-cumulus-docs/web-misc/swot_mission_docs/pdd/D-56413_SWOT_Product_Description_L2_HR_RiverSP_20231026_RevB_w-sigs.pdf
  // https://podaac.github.io/hydrocron/user-guide/fields.html#fields-detail
  const swotVariables = ref([
    {
      abbreviation: 'time_str',
      name: 'Date',
      definition: 'Date and time of the measurement',
      default: false,
      always: true,
      selectable: false,
      fileType: 'all',
      plottable: false
    },
    {
      abbreviation: 'wse',
      name: 'Water Surface Elevation',
      unit: 'm',
      definition:
        'Fitted reach water surface elevation, relative to the provided model of the geoid (geoid_hght), with corrections for media delays (wet and dry troposphere, and ionosphere), the crossover correction, and tidal effects (solid_tide, load_tidef, and pole_tide) applied.',
      default: true,
      always: false,
      selectable: true,
      fileType: 'all',
      plottable: true
    },
    {
      abbreviation: 'slope',
      name: 'Reach Slope',
      unit: 'm/m',
      definition:
        'Fitted water surface slope, relative to the provided model of the geoid(geoid_hght), and with the same corrections and tidal effects applied as for wse. The units are m/m. The downstream direction is defined by the PRD. A positive slope means that the downstream WSE is lower.',
      default: true,
      always: false,
      selectable: true,
      fileType: 'reach',
      plottable: true
    },
    {
      abbreviation: 'width',
      name: 'Reach Width',
      unit: 'm',
      definition: 'Reach width',
      default: true,
      always: false,
      selectable: true,
      fileType: 'reach,node',
      plottable: true
    },
    {
      abbreviation: 'area_total',
      name: 'Water Surface Area',
      unit: 'm^2',
      definition:
        'Total estimated water surface area, including area_detct and any dark water that was not detected as water in the SWOT observation but identified through the use of a prior water probability map.',
      default: true,
      always: false,
      selectable: true,
      fileType: 'all',
      plottable: true
    },
    {
      abbreviation: 'd_x_area',
      name: 'Change in area',
      unit: 'm^3/s*m^2',
      definition:
        'Change in the channel cross-sectional area from the value reported in the PRD. This parameter is used in the computation of discharge',
      default: false,
      always: false,
      selectable: false,
      fileType: 'reach',
      plottable: true
    },
    {
      abbreviation: 'dschg_c',
      name: 'Discharge',
      unit: 'm^3/s',
      definition: 'Discharge from the consensus algorithm',
      default: false,
      always: false,
      selectable: false,
      fileType: 'reach',
      plottable: true
    },
    {
      abbreviation: 'geometry',
      name: 'Geometry',
      unit: '',
      definition: 'The geometry of the reach',
      default: false,
      always: false,
      selectable: false,
      fileType: 'all',
      plottable: false
    },
    {
      abbreviation: 'reach_q',
      name: 'Reach Quality',
      unit: '',
      definition:
        'Summary quality indicator for the reach measurement. Values of 0, 1, 2, and 3 indicate good, suspect, degraded, and bad measurements, respectively. Measurements that are marked as suspect may have large errors. Measurements that are marked as degraded very likely do have large errors. Measurements that are marked as bad may be nonsensicial and should be ignored.',
      default: false,
      always: true,
      selectable: false,
      fileType: 'reach',
      plottable: false
    },
    {
      abbreviation: 'node_q',
      name: 'Node Quality',
      unit: '',
      definition:
        'Summary quality indicator for the node measurement. Values of 0, 1, 2, and 3 indicate good, suspect, degraded, and bad measurements, respectively. Measurements that are marked as suspect may have large errors. Measurements that are marked as degraded very likely do have large errors. Measurements that are marked as bad may be nonsensicial and should be ignored.',
      default: false,
      always: true,
      selectable: false,
      fileType: 'node',
      plottable: false
    },
    {
      abbreviation: 'quality_f',
      name: 'Lake Quality Flag',
      unit: '',
      definition:
        'Summary quality indicator for the lake measurement. Values of 0, 1, 2, and 3 indicate good, suspect, degraded, and bad measurements, respectively. Measurements that are marked as suspect may have large errors. Measurements that are marked as degraded very likely do have large errors. Measurements that are marked as bad may be nonsensicial and should be ignored.',
      default: false,
      always: true,
      selectable: false,
      fileType: 'priorlake',
      plottable: false
    },
    {
      abbreviation: 'node_dist',
      name: 'Node Dispersion',
      unit: 'm',
      definition: 'Mean distance between observed and prior river database node locations.',
      default: false,
      always: false,
      selectable: false,
      fileType: 'node',
      plottable: false
    },
    {
      abbreviation: 'p_dist_out',
      name: 'Distance to Outlet',
      unit: 'm',
      definition: 'Along-stream distance from the reach center to the outlet, from the PRD.',
      default: false,
      always: true,
      selectable: false,
      fileType: 'node',
      plottable: false
    },
    {
      abbreviation: 'lake_name',
      name: 'Lake Name',
      unit: '',
      definition: 'Name of the lake, if available.',
      default: true,
      always: false,
      selectable: false,
      fileType: 'priorlake',
      plottable: false
    },
    {
      abbreviation: 'PLD_version',
      name: 'Prior Lake Database Version',
      unit: '',
      definition: 'Version of the Prior Lake Database used to generate the lake data.',
      default: true,
      always: false,
      selectable: false,
      fileType: 'priorlake',
      plottable: false
    }
  ])

  const defaultVariables = swotVariables.value.filter((variable) => variable.default)
  const queryVariables = (fileType = 'reach', always = undefined) => {
    return swotVariables.value.filter((variable) => {
      return (
        (variable.fileType.toLowerCase().includes(fileType.toLowerCase()) ||
          variable.fileType === 'all') &&
        (always === undefined || variable.always === always)
      )
    })
  }
  const selectedVariables = ref(defaultVariables)

  const selectableVariables = swotVariables.value.filter((variable) => variable.selectable)

  const addVariable = (variable) => {
    this.selectedVariables.push(variable)
  }

  const swordVariables = ref([
    {
      abbreviation: 'x',
      definition: 'Longitude of the node or reach ranging from 180°E to 180°W',
      fileType: 'all',
      default: true,
      short_definition: 'Longitude',
      swotviz_alias: 'Longitude',
      units: 'decimal degrees',
      plottable: false,
      significant_figures: 4
    },
    {
      abbreviation: 'y',
      definition: 'Latitude of the node or reach ranging from 90°S to 90°N',
      fileType: 'all',
      default: true,
      short_definition: 'Latitude',
      swotviz_alias: 'Latitude',
      units: 'decimal degrees',
      plottable: false,
      significant_figures: 4
    },
    {
      abbreviation: 'node_id',
      definition:
        'ID of each node. The format of the id is as follows: CBBBBBRRRRNNNT where C = Continent (the first number of the Pfafstetter basin code), B = Remaining Pfafstetter basin code up to level 6, R = Reach number (assigned sequentially within a level 6 basin starting at the downstream end working upstream), N = Node number (assigned sequentially within a reach starting at the downstream end working upstream), T = Type (1=river, 2=lake off river, 3=lake on river, 4=dam or waterfall, 5=unreliable topology, 6=ghost node)',
      fileType: 'node',
      default: true,
      short_definition: 'Node ID',
      swotviz_alias: 'Node ID',
      units: '',
      plottable: false,
      significant_figures: 0
    },
    {
      abbreviation: 'node_length',
      definition: 'Node length measured along the GRWL centerline points',
      fileType: 'node',
      default: false,
      short_definition: 'Node length measured along the GRWL centerline points',
      swotviz_alias: 'Node Length',
      units: 'meters',
      plottable: false,
      significant_figures: 2
    },
    {
      abbreviation: 'reach_id',
      definition:
        'ID of each reach. The format of the id is as follows: CBBBBBRRRRT where C = Continent (the first number of the Pfafstetter basin code), B = Remaining Pfafstetter basin codes up to level 6, R = Reach number (assigned sequentially within a level 6 basin starting at the downstream end working upstream, T = Type (1=river, 2=lake off river, 3=lake on river, 4=dam or waterfall, 5=unreliable topology, 6=ghost reach)',
      fileType: 'reach',
      default: true,
      short_definition: 'Reach ID', // Differs from the abbreviation in the SWORD documentation
      // https://zenodo.org/records/3898570
      // abbreviation: 'reach_length',
      swotviz_alias: 'Reach ID',
      units: '',
      plottable: false,
      significant_figures: 0
    },
    {
      abbreviation: 'reach_len',
      definition: 'Reach length measured along the GRWL centerline points',
      fileType: 'reach',
      default: true,
      short_definition: 'Reach Length',
      swotviz_alias: 'Reach Length',
      units: 'meters',
      plottable: false,
      significant_figures: 2
    },
    {
      abbreviation: 'wse',
      definition:
        'Average water surface elevation (WSE) value for a node or reach. WSEs are extracted from the MERIT Hydro dataset (Yamazaki et al., 2019) and referenced to the EGM96 geoid',
      fileType: 'all',
      default: true,
      short_definition: 'Average water surface elevation (WSE)',
      swotviz_alias: 'Average Water Surface Elevation (WSE)',
      units: 'meters',
      plottable: true,
      plot_definition: 'Water Surface Elevation',
      significant_figures: 2
    },
    {
      abbreviation: 'wse_var',
      definition:
        'WSE variance along the GRWL centerline points used to calculate the average WSE for each node or reach',
      fileType: 'all',
      default: false,
      short_definition:
        'WSE variance along the GRWL centerline points used to calculate the average WSE for each node or reach',
      swotviz_alias: 'WSE Variance',
      units: 'square meters',
      plottable: false,
      significant_figures: 2
    },
    {
      abbreviation: 'width',
      definition: 'Average width for a node or reach',
      fileType: 'all',
      default: true,
      short_definition: 'Average width',
      swotviz_alias: 'Average Width',
      units: 'meters',
      plottable: true,
      plot_definition: 'Width',
      significant_figures: 2
    },
    {
      abbreviation: 'width_var',
      definition:
        'Width variance along the GRWL centerline points used to calculate the average width for each node or reach',
      fileType: 'all',
      default: false,
      short_definition:
        'Width variance along the GRWL centerline points used to calculate the average width for each node or reach',
      swotviz_alias: 'Width Variance',
      units: 'square meters',
      plottable: false,
      significant_figures: 2
    },
    {
      abbreviation: 'facc',
      definition:
        'Maximum flow accumulation value for a node or reach. Flow accumulation values are extracted from the MERIT Hydro dataset (Yamazaki et al., 2019)',
      fileType: 'all',
      default: false,
      short_definition:
        'Maximum flow accumulation value for a node or reach. Flow accumulation values are extracted from the MERIT Hydro dataset (Yamazaki et al., 2019)',
      swotviz_alias: 'Maximum Flow Accumulation',
      units: 'square kilometers',
      plottable: true,
      plot_definition: 'Flow Accumulation',
      significant_figures: 0
    },
    {
      abbreviation: 'n_chan_max',
      definition: 'Maximum number of channels for each node or reach',
      fileType: 'all',
      default: false,
      short_definition: 'Maximum number of channels for each node or reach',
      swotviz_alias: 'Maximum Channel Count',
      units: '',
      plottable: false,
      significant_figures: 0
    },
    {
      abbreviation: 'n_chan_mod',
      definition: 'Mode of the number of channels for each node or reach',
      fileType: 'all',
      default: false,
      short_definition: 'Mode of the number of channels for each node or reach',
      swotviz_alias: 'Mode Channel Count',
      units: '',
      plottable: false,
      significant_figures: 0
    },
    {
      abbreviation: 'obstr_type',
      definition:
        'Type of obstruction for each node or reach based on the Globale Obstruction Database (GROD, Whittemore et al., 2020) and HydroFALLS data (http://wp.geog.mcgill.ca/hydrolab/hydrofalls). Obstr_type values: 0 - No Dam, 1 - Dam, 2 - Channel Dam, 3 - Lock, 4 - Low Permeable Dam, 5 - Waterfall',
      fileType: 'all',
      default: false,
      short_definition:
        'Type of obstruction for each node or reach based on the Globale Obstruction Database (GROD, Whittemore et al., 2020) and HydroFALLS data (http://wp.geog.mcgill.ca/hydrolab/hydrofalls). Obstr_type values: 0 - No Dam, 1 - Dam, 2 - Channel Dam, 3 - Lock, 4 - Low Permeable Dam, 5 - Waterfall',
      swotviz_alias: 'Obstruction Type',
      units: '',
      plottable: false,
      mapping: {
        0: 'No Dam',
        1: 'Dam',
        2: 'Channel Dam',
        3: 'Lock',
        4: 'Low Permeable Dam',
        5: 'Waterfall'
      }
    },
    {
      abbreviation: 'grod_id',
      definition: 'The unique GROD ID for each node or reach with obstr_type values 1-4',
      fileType: 'all',
      default: false,
      short_definition: 'The unique GROD ID for each node or reach with obstr_type values 1-4',
      swotviz_alias: 'Global River Obstruction Database (GROD) ID',
      units: '',
      plottable: false,
      significant_figures: 0,
      mapping: {
        0: '-'
      }
    },
    {
      abbreviation: 'hfalls_id',
      definition: 'The unique HydroFALLS ID for each node or reach with obstr_type value 5',
      fileType: 'all',
      default: false,
      short_definition: 'The unique HydroFALLS ID for each node or reach with obstr_type value 5',
      swotviz_alias: 'HydroFALLS ID',
      units: '',
      plottable: false,
      significant_figures: 0,
      mapping: {
        0: '-'
      }
    },
    {
      abbreviation: 'dist_out',
      definition: 'Distance from the river outlet for each node or reach',
      fileType: 'all',
      default: false,
      short_definition: 'Distance from the river outlet for each node or reach',
      swotviz_alias: 'Distance to Outlet',
      units: 'meters',
      plottable: false,
      significant_figures: 2
    },
    {
      abbreviation: 'type',
      definition:
        'Type identifier for a node or reach: 1=river, 2=lake off river, 3=lake on river, 4=dam or waterfall, 5=unreliable topology, 6=ghost reach/node',
      fileType: 'all',
      default: false,
      short_definition:
        'Type identifier for a node or reach: 1=river, 2=lake off river, 3=lake on river, 4=dam or waterfall, 5=unreliable topology, 6=ghost reach/node',
      swotviz_alias: 'Reach Type',
      units: '',
      plottable: false,
      mapping: {
        1: 'River',
        2: 'Lake Off River',
        3: 'Lake On River',
        4: 'Dam or Waterfall',
        5: 'Unreliable Topology',
        6: 'Ghost Reach'
      }
    },
    {
      abbreviation: 'lakeflag',
      definition:
        'GRWL water body identifier for each reach:  0=river, 1=lake/reservoir, 2=tidally influenced river,  3=canal',
      fileType: 'reach',
      default: false,
      short_definition:
        'GRWL water body identifier for each reach:  0=river, 1=lake/reservoir, 2=tidally influenced river,  3=canal',
      swotviz_alias: 'Lake Flag',
      units: '',
      plottable: false,
      mapping: {
        0: 'River',
        1: 'Lake/Reservoir',
        2: 'Tidally Influenced River',
        3: 'Canal'
      }
    },
    {
      abbreviation: 'slope',
      definition:
        'Reach average slope calculated along the GRWL centerline points. Slopes are calculated using a linear regression',
      fileType: 'reach',
      default: true,
      short_definition: 'Average reach slope',
      swotviz_alias: 'Average Reach Slope',
      units: 'meters/kilometer',
      plottable: true,
      plot_definition: 'Slope',
      significant_figures: 3
    },
    {
      abbreviation: 'n_nodes',
      definition: 'Number of nodes associated with each reach',
      fileType: 'reach',
      default: true,
      short_definition: 'Number of nodes associated with the reach',
      swotviz_alias: 'Node Count',
      units: '',
      plottable: false,
      significant_figures: 0
    },
    {
      abbreviation: 'n_rch_up',
      definition: 'Number of upstream reaches for each reach',
      fileType: 'reach',
      default: false,
      short_definition: 'Number of upstream reaches for each reach',
      swotviz_alias: 'Upstream Reach Count',
      units: '',
      plottable: false,
      significant_figures: 0
    },
    {
      abbreviation: 'n_rch_down',
      definition: 'Number of downstream reaches for each reach',
      fileType: 'reach',
      default: false,
      short_definition: 'Number of downstream reaches for each reach',
      swotviz_alias: 'Downstream Reach Count',
      units: '',
      plottable: false,
      significant_figures: 0
    },
    {
      abbreviation: 'rch_id_up',
      definition: 'Reach IDs of the upstream neighboring reaches',
      fileType: 'reach',
      default: true,
      short_definition: 'Upstream reach ID',
      swotviz_alias: 'Upstream Reach ID',
      units: '',
      plottable: false,
      significant_figures: 0
    },
    {
      abbreviation: 'rch_id_dn',
      definition: 'Reach IDs of the downstream neighboring reaches',
      fileType: 'reach',
      default: true,
      short_definition: 'Downstram reach ID',
      swotviz_alias: 'Downstram Reach ID',
      units: '',
      plottable: false,
      significant_figures: 0
    },
    {
      abbreviation: 'swot_obs',
      definition:
        'The maximum number of SWOT passes to intersect each reach during the 21 day orbit cycle',
      fileType: 'reach',
      default: false,
      short_definition:
        'The maximum number of SWOT passes to intersect each reach during the 21 day orbit cycle',
      swotviz_alias: 'SWOT Pass Count',
      units: '',
      plottable: false,
      significant_figures: 0
    },
    {
      abbreviation: 'swot_orbit',
      definition:
        'A list of the SWOT orbit tracks that intersect each reach during the 21 day orbit cycle',
      fileType: 'reach',
      default: false,
      short_definition:
        'A list of the SWOT orbit tracks that intersect each reach during the 21 day orbit cycle',
      swotviz_alias: 'SWOT Orbit Tracks',
      units: '',
      plottable: false,
      significant_figures: 0
    },
    {
      abbreviation: 'lake_id',
      definition:
        'The unique identifier for each lake in the Prior Lake Database (PLD). This ID is used to link the reach or node to the corresponding lake information in the PLD.',
      fileType: 'PriorLake',
      default: true,
      short_definition: 'Prior Lake Database (PLD) ID',
      swotviz_alias: 'Prior Lake Database ID',
      units: '',
      plottable: false,
      significant_figures: 0
    },
    {
      abbreviation: 'basin_id',
      definition:
        'The unique identifier for the basin in which the lake is located, as defined in the Prior Lake Database (PLD). This ID is used to link the reach or node to the corresponding basin information in the PLD.',
      fileType: 'PriorLake',
      default: true,
      short_definition: 'Prior Lake Database (PLD) Basin ID',
      swotviz_alias: 'Prior Lake Database Basin ID',
      units: '',
      plottable: false,
      significant_figures: 0
    },
    {
      abbreviation: 'names',
      definition:
        'A list of names associated with the lake in the Prior Lake Database (PLD). This field can contain multiple names, such as local names, official names, or alternative names for the lake.',
      fileType: 'PriorLake',
      default: true,
      short_definition: 'Prior Lake Database (PLD) Names',
      swotviz_alias: 'Prior Lake Database Names',
      units: '',
      plottable: false,
      significant_figures: 0
    },
    {
      abbreviation: 'lake_type',
      definition:
        'The type of lake as classified in the Prior Lake Database (PLD). This field indicates whether the lake is a natural lake, reservoir, or other type of water body.',
      fileType: 'PriorLake',
      default: true,
      short_definition: 'Prior Lake Database (PLD) Lake Type',
      swotviz_alias: 'Prior Lake Database Lake Type',
      units: '',
      plottable: false,
      significant_figures: 0
    },
    {
      abbreviation: 'ice_clim_flag',
      definition: 'A flag indicating whether the lake is affected by ice climate conditions.',
      short_definition: 'Prior Lake Database Ice Climate Flag',
      fileType: 'PriorLake',
      default: false,
      swotviz_alias: 'Prior Lake Database Ice Climate Flag',
      units: '',
      plottable: false,
      significant_figures: 3
    },
    {
      abbreviation: 'ice_clim_flag2',
      definition: 'A flag indicating whether the lake is affected by ice climate conditions.',
      fileType: 'PriorLake',
      default: false,
      short_definition: 'Prior Lake Database Ice Climate Flag 2',
      swotviz_alias: 'Prior Lake Database Ice Climate Flag 2',
      units: '',
      plottable: false,
      significant_figures: 3
    },
    {
      abbreviation: 'reach_id_list',
      definition:
        'A list of reach IDs associated with the lake in the Prior Lake Database (PLD). This field can contain multiple reach IDs that are linked to the lake.',
      fileType: 'PriorLake',
      default: false,
      short_definition: 'Prior Lake Database (PLD) Reach ID List',
      swotviz_alias: 'Prior Lake Database Reach ID List',
      units: '',
      plottable: false,
      significant_figures: 0,
      hidden: true
    },
    {
      abbreviation: 'ref_area',
      definition:
        'The reference area of the lake in the Prior Lake Database (PLD). This field provides the area of the lake as defined in the PLD, which may be used for comparison with other measurements or models.',
      fileType: 'PriorLake',
      default: false,
      short_definition: 'Prior Lake Database (PLD) Reference Area',
      swotviz_alias: 'Prior Lake Database Reference Area',
      units: 'square meters',
      plottable: false,
      significant_figures: 2
    }
  ])

  /**
   * Retrieves a variable object based on its abbreviation and file type.
   * @param {string} abbreviation - The abbreviation of the variable.
   * @param {string} [fileType='reach'] - The file type of the variable.
   * @param {boolean} [defaultOnly=false] - Indicates whether to only consider variables with a default value.
   * @returns {object|undefined} The variable object if found, otherwise undefined.
   */
  function variableFromAbreviation(abbreviation, fileType = 'reach', defaultOnly = false) {
    return swordVariables.value.find((variable) => {
      if (defaultOnly && !variable.default) {
        return false
      }
      return (
        variable.abbreviation === abbreviation &&
        (variable.fileType.toLowerCase().includes(fileType.toLowerCase()) ||
          variable.fileType === 'all') &&
        variable.default === defaultOnly
      )
    })
  }

  /**
   * Retrieves the descriptions of sword features for a given feature object.
   *
   * @param {Object} feature - The feature object containing sword features.
   * @param {boolean} [defaultOnly=false] - Indicates whether to retrieve only default descriptions.
   * @returns {Array} - An array of descriptions for the sword features.
   */
  function getSwordDescriptions(feature, defaultOnly = false, fileType = null) {
    if (!fileType) {
      const featuresStore = useFeaturesStore()
      fileType = featuresStore.determineFeatureType(feature)
      if (!fileType) {
        console.warn('Could not determine file type for feature:', feature)
        return []
      }
    }

    const descriptions = []
    for (const [abbreviation, val] of Object.entries(feature.properties)) {
      const found = variableFromAbreviation(abbreviation, fileType, defaultOnly)
      // Skip if variable is found and has hidden = true
      if (found && found.hidden) {
        continue
      }
      if (found) {
        let displayValue
        const displayKey = found.swotviz_alias || found.short_definition // Use alias if available
        if (found.mapping && found.mapping[val]) {
          displayValue = found.mapping[val]
        } else if (typeof val === 'string' && val.includes(' ')) {
          displayValue = val.split(' ').join(', ')
        } else {
          const isNumber = !isNaN(parseFloat(val)) && isFinite(val)
          displayValue = isNumber
            ? `${parseFloat(val).toFixed(found.significant_figures)} ${found.units}`
            : `${val} ${found.units}`
        }
        found.value = displayValue
        descriptions.push({ ...found, displayKey })
      }
    }
    // for now, we dump all of the key/value pairs in the feature
    if (fileType.toLowerCase() === 'priorlake' && !defaultOnly) {
      for (let [key, val] of Object.entries(feature.properties)) {
        // first check if the key is already in the descriptions
        if (descriptions.some((desc) => desc.abbreviation === key)) {
          continue
        }
        // Also check if this would be a hidden variable if it existed in swordVariables
        const potentialHiddenVar = swordVariables.value.find(
          (v) => v.abbreviation === key && v.hidden
        )
        if (potentialHiddenVar) {
          continue
        }
        descriptions.push({
          abbreviation: key,
          name: key,
          definition: `${key}`,
          value: val,
          fileType: 'PriorLake',
          default: false,
          short_definition: key,
          swotviz_alias: key,
          displayKey: key,
          units: '',
          plottable: false,
          significant_figures: 0
        })
      }
    }
    return descriptions
  }

  return {
    swotVariables,
    selectableVariables,
    addVariable,
    selectedVariables,
    defaultVariables,
    queryVariables,
    swordVariables,
    getSwordDescriptions
  }
})
