import { useMemo } from 'react'
import { EChart } from './EChart'
import type { EChartsOption } from './EChart'
import { palette, fontFamily } from '../../theme/palette'

interface BarChartProps {
  data: { key: string; tries: number }[]
}

/**
 * チーム別のトライ数合計を示す棒グラフ。
 * 系列は1つ（他の次元との掛け合わせがない）ため、単色（slot 1）で統一し、
 * チームの識別はx軸ラベルに任せる。
 */
export function BarChart({ data }: BarChartProps) {
  const option = useMemo<EChartsOption>(
    () => ({
      textStyle: { fontFamily, color: palette.textPrimary },
      grid: { left: 40, right: 16, top: 24, bottom: 72 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (v) => `${v}本`,
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.key),
        axisLine: { lineStyle: { color: palette.baseline } },
        axisTick: { show: false },
        axisLabel: { color: palette.textSecondary, rotate: 45, interval: 0 },
      },
      yAxis: {
        type: 'value',
        name: '本',
        axisLabel: { color: palette.muted },
        splitLine: { lineStyle: { color: palette.gridline } },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.tries),
          barMaxWidth: 24,
          itemStyle: { color: palette.categorical[0], borderRadius: [4, 4, 0, 0] },
        },
      ],
    }),
    [data],
  )

  return <EChart option={option} height={360} />
}
