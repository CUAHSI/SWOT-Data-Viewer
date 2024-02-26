const getSingleFakeDataset = () => {
  return Array.from({ length: 7 }, () => Math.floor(Math.random() * 100))
}

const dynamicColors = function () {
  var r = Math.floor(Math.random() * 255)
  var g = Math.floor(Math.random() * 255)
  var b = Math.floor(Math.random() * 255)
  return 'rgb(' + r + ',' + g + ',' + b + ')'
}

const getFakeDatasets = (selectedFeatures) => {
  return selectedFeatures.map((feature) => {
    return {
      label: `${feature.sword.river_name} | ${feature.sword.reach_id}`,
      data: getSingleFakeDataset(),
      borderColor: dynamicColors()
    }
  })
}

function buildFakeData(selectedFeatures) {
  return {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: getFakeDatasets(selectedFeatures)
  }
}

const knownQueriesWithData = [
  {
    feature: 'Reach',
    feature_id: '72390300011',
    start_time: '2023-06-01T00:00:00Z',
    end_time: '2023-10-30T00:00:00Z',
    output: 'geojson',
    fields: 'feature_id,time_str,wse'
  }
]

export { buildFakeData, knownQueriesWithData }
