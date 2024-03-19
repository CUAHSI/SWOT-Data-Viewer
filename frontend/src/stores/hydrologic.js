import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHydrologicStore = defineStore('hydrologic', () => {
  // https://archive.podaac.earthdata.nasa.gov/podaac-ops-cumulus-docs/web-misc/swot_mission_docs/pdd/D-56413_SWOT_Product_Description_L2_HR_RiverSP_20200825a.pdf
  // https://archive.podaac.earthdata.nasa.gov/podaac-ops-cumulus-docs/web-misc/swot_mission_docs/pdd/D-56413_SWOT_Product_Description_L2_HR_RiverSP_20231026_RevB_w-sigs.pdf
  const hydroVariables = ref([
    {
      abbreviation: 'wse',
      name: 'Water Surface Elevation',
      unit: 'm',
      definition:
        'Fitted reach water surface elevation, relative to the provided model of the geoid (geoid_hght), with corrections for media delays (wet and dry troposphere, and ionosphere), the crossover correction, and tidal effects (solid_tide, load_tidef, and pole_tide) applied.',
      default: true
    },
    {
      abbreviation: 'slope',
      name: 'Slope',
      unit: 'm/m',
      definition:
        'Fitted water surface slope, relative to the provided model of the geoid(geoid_hght), and with the same corrections and tidal effects applied as for wse. The units are m/m. The downstream direction is defined by the PRD. A positive slope means that the downstream WSE is lower.',
      default: true
    },
    {
      abbreviation: 'width',
      name: 'Width',
      unit: 'm',
      definition: 'Reach width',
      default: false
    },
    {
      abbreviation: 'area_total',
      name: 'Water Surface Area',
      unit: 'm^2',
      definition:
        'Total estimated water surface area, including area_detct and any dark water that was not detected as water in the SWOT observation but identified through the use of a prior water probability map.',
      default: false
    },
    {
      abbreviation: 'd_x_area',
      name: 'Change in area',
      unit: 'm^3/s*m^2',
      definition:
        'Change in the channel cross-sectional area from the value reported in the PRD. This parameter is used in the computation of discharge',
      default: false
    },
    {
      abbreviation: 'dschg_c',
      name: 'Discharge',
      unit: 'm^3/s',
      definition: 'Discharge from the consensus algorithm',
      default: false
    }
  ])

  const defaultVariables = hydroVariables.value.filter((variable) => variable.default)
  const selectedVariables = ref(defaultVariables)

  const addVariable = (variable) => {
    this.selectedVariables.push(variable)
  }

  return { hydroVariables, addVariable, selectedVariables }
})
