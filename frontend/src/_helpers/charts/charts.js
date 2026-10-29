import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js'
import { customCanvasBackgroundColor, noDataMessage } from '@/_helpers/charts/plugins'
import zoomPlugin from 'chartjs-plugin-zoom'

ChartJS.register(
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  customCanvasBackgroundColor,
  noDataMessage,
  zoomPlugin
)

export { ChartJS }
