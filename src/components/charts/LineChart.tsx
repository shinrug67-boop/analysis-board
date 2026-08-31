import { useMemo } from 'react'
import { EChart } from './EChart'
import type { EChartsOption } from './EChart'
import { palette, fontFamily } from '../../theme/palette'
import { formatYen, formatShortDate } from '../../utils/format'

interface LineChartProps {
  data: { key: string; amount: number }[]
}

/** 日別の売上推移を示す折れ線グラフ。単一系列のためタイトルが凡例の代わりを果たす。 */
export function LineChart({ data }: LineChartProps) {
  const option = useMemo<EChartsOption>(
    () => ({
      textStyle: { fontFamily, color: palette.textPrimary },
      grid: { left: 56, right: 16, top: 24, bottom: 32 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        valueFormatter: (v) => formatYen(Number(v)),
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => formatShortDate(d.key)),
        boundaryGap: false,
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
          type: 'line',
          data: data.map((d) => d.amount),
          lineStyle: { width: 2, color: palette.categorical[0] },
          itemStyle: { color: palette.categorical[0] },
          symbol: 'circle',
          symbolSize: 8,
          showSymbol: false,
          areaStyle: { color: palette.categorical[0], opacity: 0.1 },
        },
      ],
    }),
    [data],
  )

  return <EChart option={option} />
}
