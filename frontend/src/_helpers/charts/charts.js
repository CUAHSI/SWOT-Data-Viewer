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
import { customCanvasBackgroundColor } from '@/_helpers/charts/plugins'
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
  zoomPlugin
)

export { ChartJS }
