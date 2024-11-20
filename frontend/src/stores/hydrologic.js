import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHydrologicStore = defineStore('hydrologic', () => {
  // https://archive.podaac.earthdata.nasa.gov/podaac-ops-cumulus-docs/web-misc/swot_mission_docs/pdd/D-56413_SWOT_Product_Description_L2_HR_RiverSP_20200825a.pdf
  // https://archive.podaac.earthdata.nasa.gov/podaac-ops-cumulus-docs/web-misc/swot_mission_docs/pdd/D-56413_SWOT_Product_Description_L2_HR_RiverSP_20231026_RevB_w-sigs.pdf
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
      fileType: 'all',
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
    }
  ])

  const defaultVariables = swotVariables.value.filter((variable) => variable.default)
  const queryVariables = (fileType = 'reach', always = undefined) => {
    return swotVariables.value.filter((variable) => {
      return (
        (variable.fileType === fileType.toLowerCase() || variable.fileType === 'all') &&
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
      units: 'decimal degrees',
      plottable: false
    },
    {
      abbreviation: 'y',
      definition: 'Latitude of the node or reach ranging from 90°S to 90°N',
      fileType: 'all',
      default: true,
      short_definition: 'Latitude',
      units: 'decimal degrees',
      plottable: false
    },
    {
      abbreviation: 'node_id',
      definition:
        'ID of each node. The format of the id is as follows: CBBBBBRRRRNNNT where C = Continent (the first number of the Pfafstetter basin code), B = Remaining Pfafstetter basin code up to level 6, R = Reach number (assigned sequentially within a level 6 basin starting at the downstream end working upstream), N = Node number (assigned sequentially within a reach starting at the downstream end working upstream), T = Type (1=river, 2=lake off river, 3=lake on river, 4=dam or waterfall, 5=unreliable topology, 6=ghost node)',
      fileType: 'node',
      default: true,
      short_definition: 'Node ID',
      units: '',
      plottable: false
    },
    {
      abbreviation: 'node_length',
      definition: 'Node length measured along the GRWL centerline points',
      fileType: 'node',
      default: false,
      short_definition: 'Node length measured along the GRWL centerline points',
      units: 'meters',
      plottable: false
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
      units: '',
      plottable: false
    },
    {
      abbreviation: 'reach_len',
      definition: 'Reach length measured along the GRWL centerline points',
      fileType: 'reach',
      default: true,
      short_definition: 'Reach Length',
      units: 'meters',
      plottable: false
    },
    {
      abbreviation: 'wse',
      definition:
        'Average water surface elevation (WSE) value for a node or reach. WSEs are extracted from the MERIT Hydro dataset (Yamazaki et al., 2019) and referenced to the EGM96 geoid',
      fileType: 'all',
      default: true,
      short_definition: 'Average water surface elevation (WSE)',
      units: 'meters',
      plottable: true,
      plot_definition: 'Water Surface Elevation'
    },
    {
      abbreviation: 'wse_var',
      definition:
        'WSE variance along the GRWL centerline points used to calculate the average WSE for each node or reach',
      fileType: 'all',
      default: false,
      short_definition:
        'WSE variance along the GRWL centerline points used to calculate the average WSE for each node or reach',
      units: 'square meters',
      plottable: false
    },
    {
      abbreviation: 'width',
      definition: 'Average width for a node or reach',
      fileType: 'all',
      default: true,
      short_definition: 'Average width',
      units: 'meters',
      plottable: true,
      plot_definition: 'Width'
    },
    {
      abbreviation: 'width_var',
      definition:
        'Width variance along the GRWL centerline points used to calculate the average width for each node or reach',
      fileType: 'all',
      default: false,
      short_definition:
        'Width variance along the GRWL centerline points used to calculate the average width for each node or reach',
      units: 'square meters',
      plottable: false
    },
    {
      abbreviation: 'facc',
      definition:
        'Maximum flow accumulation value for a node or reach. Flow accumulation values are extracted from the MERIT Hydro dataset (Yamazaki et al., 2019)',
      fileType: 'all',
      default: false,
      short_definition:
        'Maximum flow accumulation value for a node or reach. Flow accumulation values are extracted from the MERIT Hydro dataset (Yamazaki et al., 2019)',
      units: 'square kilometers',
      plottable: true,
      plot_definition: 'Flow Accumulation'
    },
    {
      abbreviation: 'n_chan_max',
      definition: 'Maximum number of channels for each node or reach',
      fileType: 'all',
      default: false,
      short_definition: 'Maximum number of channels for each node or reach',
      units: '',
      plottable: false
    },
    {
      abbreviation: 'n_chan_mod',
      definition: 'Mode of the number of channels for each node or reach',
      fileType: 'all',
      default: false,
      short_definition: 'Mode of the number of channels for each node or reach',
      units: '',
      plottable: false
    },
    {
      abbreviation: 'obstr_type',
      definition:
        'Type of obstruction for each node or reach based on the Globale Obstruction Database (GROD, Whittemore et al., 2020) and HydroFALLS data (http://wp.geog.mcgill.ca/hydrolab/hydrofalls). Obstr_type values: 0 - No Dam, 1 - Dam, 2 - Channel Dam, 3 - Lock, 4 - Low Permeable Dam, 5 - Waterfall',
      fileType: 'all',
      default: false,
      short_definition:
        'Type of obstruction for each node or reach based on the Globale Obstruction Database (GROD, Whittemore et al., 2020) and HydroFALLS data (http://wp.geog.mcgill.ca/hydrolab/hydrofalls). Obstr_type values: 0 - No Dam, 1 - Dam, 2 - Channel Dam, 3 - Lock, 4 - Low Permeable Dam, 5 - Waterfall',
      units: '',
      plottable: false
    },
    {
      abbreviation: 'grod_id',
      definition: 'The unique GROD ID for each node or reach with obstr_type values 1-4',
      fileType: 'all',
      default: false,
      short_definition: 'The unique GROD ID for each node or reach with obstr_type values 1-4',
      units: '',
      plottable: false
    },
    {
      abbreviation: 'hfalls_id',
      definition: 'The unique HydroFALLS ID for each node or reach with obstr_type value 5',
      fileType: 'all',
      default: false,
      short_definition: 'The unique HydroFALLS ID for each node or reach with obstr_type value 5',
      units: '',
      plottable: false
    },
    {
      abbreviation: 'dist_out',
      definition: 'Distance from the river outlet for each node or reach',
      fileType: 'all',
      default: false,
      short_definition: 'Distance from the river outlet for each node or reach',
      units: 'meters',
      plottable: false
    },
    {
      abbreviation: 'type',
      definition:
        'Type identifier for a node or reach: 1=river, 2=lake off river, 3=lake on river, 4=dam or waterfall, 5=unreliable topology, 6=ghost reach/node',
      fileType: 'all',
      default: false,
      short_definition:
        'Type identifier for a node or reach: 1=river, 2=lake off river, 3=lake on river, 4=dam or waterfall, 5=unreliable topology, 6=ghost reach/node',
      units: '',
      plottable: false
    },
    {
      abbreviation: 'lakeflag',
      definition:
        'GRWL water body identifier for each reach:  0=river, 1=lake/reservoir, 2=tidally influenced river,  3=canal',
      fileType: 'reach',
      default: false,
      short_definition:
        'GRWL water body identifier for each reach:  0=river, 1=lake/reservoir, 2=tidally influenced river,  3=canal',
      units: '',
      plottable: false
    },
    {
      abbreviation: 'slope',
      definition:
        'Reach average slope calculated along the GRWL centerline points. Slopes are calculated using a linear regression',
      fileType: 'reach',
      default: true,
      short_definition: 'Average reach slope',
      units: 'meters/kilometer',
      plottable: true,
      plot_definition: 'Slope'
    },
    {
      abbreviation: 'n_nodes',
      definition: 'Number of nodes associated with each reach',
      fileType: 'reach',
      default: true,
      short_definition: 'Number of nodes associated with the reach',
      units: '',
      plottable: false
    },
    {
      abbreviation: 'n_rch_up',
      definition: 'Number of upstream reaches for each reach',
      fileType: 'reach',
      default: false,
      short_definition: 'Number of upstream reaches for each reach',
      units: '',
      plottable: false
    },
    {
      abbreviation: 'n_rch_down',
      definition: 'Number of downstream reaches for each reach',
      fileType: 'reach',
      default: false,
      short_definition: 'Number of downstream reaches for each reach',
      units: '',
      plottable: false
    },
    {
      abbreviation: 'rch_id_up',
      definition: 'Reach IDs of the upstream neighboring reaches',
      fileType: 'reach',
      default: true,
      short_definition: 'Upstream reach ID',
      units: '',
      plottable: false
    },
    {
      abbreviation: 'rch_id_dn',
      definition: 'Reach IDs of the downstream neighboring reaches',
      fileType: 'reach',
      default: true,
      short_definition: 'Downstram reach ID',
      units: '',
      plottable: false
    },
    {
      abbreviation: 'swot_obs',
      definition:
        'The maximum number of SWOT passes to intersect each reach during the 21 day orbit cycle',
      fileType: 'reach',
      default: false,
      short_definition:
        'The maximum number of SWOT passes to intersect each reach during the 21 day orbit cycle',
      units: '',
      plottable: false
    },
    {
      abbreviation: 'swot_orbits',
      definition:
        'A list of the SWOT orbit tracks that intersect each reach during the 21 day orbit cycle',
      fileType: 'reach',
      default: false,
      short_definition:
        'A list of the SWOT orbit tracks that intersect each reach during the 21 day orbit cycle',
      units: '',
      plottable: false
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
        (variable.fileType === fileType || variable.fileType === 'all') &&
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
  function getSwordDescriptions(feature, defaultOnly = false, fileType = 'reach') {
    const descriptions = []
    for (const [abbreviation, val] of Object.entries(feature)) {
      const found = variableFromAbreviation(abbreviation, fileType, defaultOnly)
      if (found) {
        found.value = `${val} ${found.units}`
        descriptions.push(found)
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
},
{ persist: true })
