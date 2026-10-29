import { toFont } from 'chart.js/helpers'

const customCanvasBackgroundColor = {
  id: 'customCanvasBackgroundColor',
  beforeDraw: (chart, args, options) => {
    const { ctx } = chart
    ctx.save()
    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillStyle = options.color || '#99ffff'
    ctx.fillRect(0, 0, chart.width, chart.height)
    ctx.restore()
  }
}

// A chart has data when any visible dataset has at least one point to draw.
// Points with a null/NaN value (e.g. Discharge rows without an estimate) are skipped by Chart.js.
const hasDrawablePoints = (chart) =>
  chart.data.datasets.some(
    (dataset, i) =>
      chart.isDatasetVisible(i) && chart.getDatasetMeta(i).data.some((point) => !point.skip)
  )

// Writes a message into the plot area when there is nothing to draw, e.g. no observations
// in the selected time range. It is drawn on the canvas, under the axes' frame, so it reads
// as part of the plot rather than an overlay.
const noDataMessage = {
  id: 'noDataMessage',
  defaults: {
    text: 'No data available for the selected time range.',
    color: '#757575',
    backgroundColor: 'white',
    font: { size: 16 },
    padding: 8
  },
  beforeDatasetsDraw: (chart, args, options) => {
    if (hasDrawablePoints(chart)) {
      return
    }
    const { ctx, chartArea } = chart
    const font = toFont(options.font)
    const x = (chartArea.left + chartArea.right) / 2
    const y = (chartArea.top + chartArea.bottom) / 2

    ctx.save()
    ctx.font = font.string
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // clear the grid lines behind the text so it reads cleanly
    const width = ctx.measureText(options.text).width + options.padding * 2
    const height = font.lineHeight + options.padding * 2
    ctx.fillStyle = options.backgroundColor
    ctx.fillRect(x - width / 2, y - height / 2, width, height)
    ctx.fillStyle = options.color
    ctx.fillText(options.text, x, y)
    ctx.restore()
  }
}

export { customCanvasBackgroundColor, noDataMessage }
