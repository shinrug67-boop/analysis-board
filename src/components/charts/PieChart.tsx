import { useMemo } from 'react'
import { EChart } from './EChart'
import type { EChartsOption } from './EChart'
import { palette, fontFamily } from '../../theme/palette'

interface PieChartProps {
  data: { key: 'W' | 'L' | 'D'; label: string; count: number }[]
}

const RESULT_COLOR: Record<'W' | 'L' | 'D', string> = {
  W: palette.status.good,
  L: palette.status.critical,
  D: palette.status.neutral,
}

/**
 * 勝敗内訳（勝ち/負け/引き分け）を示すドーナツグラフ。
 * これは名義カテゴリではなく状態（良い/悪い/中立）を表すため、categoricalではなくstatus色を使う。
 */
export function PieChart({ data }: PieChartProps) {
  const option = useMemo<EChartsOption>(
    () => ({
      textStyle: { fontFamily, color: palette.textPrimary },
      tooltip: {
        trigger: 'item',
        valueFormatter: (v) => `${v}試合`,
      },
      legend: {
        bottom: 0,
        left: 'center',
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: palette.textSecondary },
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderColor: palette.surface,
            borderWidth: 2,
          },
          label: {
            color: palette.textSecondary,
            formatter: '{b}\n{d}%',
          },
          labelLine: { lineStyle: { color: palette.baseline } },
          data: data.map((d) => ({
            name: d.label,
            value: d.count,
            itemStyle: { color: RESULT_COLOR[d.key] },
          })),
        },
      ],
    }),
    [data],
  )

  return <EChart option={option} height={360} />
}
