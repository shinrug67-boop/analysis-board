import { useMemo } from 'react'
import { EChart } from './EChart'
import type { EChartsOption } from './EChart'
import { palette, fontFamily } from '../../theme/palette'
import { formatYen } from '../../utils/format'

interface BarChartProps {
  data: { key: string; amount: number }[]
  colorMap: Record<string, string>
}

/** 地域別の売上合計を示す棒グラフ。バーの色はcolorMapで系列（地域）ごとに固定される。 */
export function BarChart({ data, colorMap }: BarChartProps) {
  const option = useMemo<EChartsOption>(
    () => ({
      textStyle: { fontFamily, color: palette.textPrimary },
      grid: { left: 56, right: 16, top: 24, bottom: 32 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (v) => formatYen(Number(v)),
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.key),
        axisLine: { lineStyle: { color: palette.baseline } },
        axisTick: { show: false },
        axisLabel: { color: palette.textSecondary },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: palette.muted, formatter: (v: number) => formatYen(v) },
        splitLine: { lineStyle: { color: palette.gridline } },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => ({
            value: d.amount,
            itemStyle: { color: colorMap[d.key] ?? palette.categorical[0] },
          })),
          barMaxWidth: 24,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    }),
    [data, colorMap],
  )

  return <EChart option={option} />
}
