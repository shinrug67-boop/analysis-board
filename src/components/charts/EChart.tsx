import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import {
  BarChart as EChartsBar,
  LineChart as EChartsLine,
  PieChart as EChartsPie,
  LinesChart as EChartsLines,
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DatasetComponent,
  MarkLineComponent,
  MarkAreaComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ComposeOption } from 'echarts/core'
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption, LinesSeriesOption } from 'echarts/charts'
import type {
  GridComponentOption,
  TooltipComponentOption,
  LegendComponentOption,
  DatasetComponentOption,
  MarkLineComponentOption,
  MarkAreaComponentOption,
} from 'echarts/components'

echarts.use([
  EChartsBar,
  EChartsLine,
  EChartsPie,
  EChartsLines,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DatasetComponent,
  MarkLineComponent,
  MarkAreaComponent,
  CanvasRenderer,
])

export type EChartsOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | LinesSeriesOption
  | GridComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | DatasetComponentOption
  | MarkLineComponentOption
  | MarkAreaComponentOption
>

interface EChartProps {
  option: EChartsOption
  height?: number
  /** heightの代わりにCSSのaspect-ratio値（例: "100/68"）でサイズを決めたい場合に指定する（PitchChart用）。 */
  aspectRatio?: string
}

/**
 * echarts の共通Reactラッパー。init/setOption/resize/disposeのライフサイクルをここに集約し、
 * 個々のチャート（Bar/Line/Pie/Pitch）は option の組み立てだけに専念する。
 */
export function EChart({ option, height = 320, aspectRatio }: EChartProps) {
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

  const style = aspectRatio ? { width: '100%', aspectRatio } : { width: '100%', height }
  return <div ref={containerRef} style={style} />
}
