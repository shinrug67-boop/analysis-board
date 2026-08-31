import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { BarChart as EChartsBar, LineChart as EChartsLine, PieChart as EChartsPie } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DatasetComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ComposeOption } from 'echarts/core'
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption } from 'echarts/charts'
import type {
  GridComponentOption,
  TooltipComponentOption,
  LegendComponentOption,
  DatasetComponentOption,
} from 'echarts/components'

echarts.use([
  EChartsBar,
  EChartsLine,
  EChartsPie,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DatasetComponent,
  CanvasRenderer,
])

export type EChartsOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | GridComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | DatasetComponentOption
>

interface EChartProps {
  option: EChartsOption
  height?: number
}

/**
 * echarts の共通Reactラッパー。init/setOption/resize/disposeのライフサイクルをここに集約し、
 * 個々のチャート（Bar/Line/Pie）は option の組み立てだけに専念する。
 */
export function EChart({ option, height = 320 }: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const chart = echarts.init(containerRef.current)
    chartRef.current = chart

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    chartRef.current?.setOption(option, true)
  }, [option])

  return <div ref={containerRef} style={{ width: '100%', height }} />
}
