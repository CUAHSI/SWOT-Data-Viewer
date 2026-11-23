import { describe, it, expect } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useChartsStore } from '@/stores/charts'

const wsaChart = (charts) => charts.find((chart) => chart.name === 'WSA vs Time')

describe('charts store water surface area units', () => {
  it('uses km^2 for the lake WSA vs Time chart', () => {
    setActivePinia(createPinia())
    const store = useChartsStore()

    expect(wsaChart(store.lakeCharts).yvar.unit).toBe('km^2')
  })

  it('keeps m^2 for the reach and node WSA charts', () => {
    setActivePinia(createPinia())
    const store = useChartsStore()

    expect(wsaChart(store.reachCharts).yvar.unit).toBe('m^2')
    expect(store.nodeCharts.find((chart) => chart.name === 'WSA vs Distance').yvar.unit).toBe('m^2')
  })
})
