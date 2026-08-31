import { useMemo } from 'react'
import { EChart } from './EChart'
import type { EChartsOption } from './EChart'
import { palette, fontFamily } from '../../theme/palette'
import { formatYen } from '../../utils/format'

interface PieChartProps {
  data: { key: string; amount: number }[]
  colorMap: Record<string, string>
}

/**
 * カテゴリ別の売上構成比を示すドーナツグラフ。
 * 色が識別チャネルそのものになるため、直接ラベル(名称+割合)と凡例の両方を付ける。
 */
export function PieChart({ data, colorMap }: PieChartProps) {
  const option = useMemo<EChartsOption>(
    () => ({
      textStyle: { fontFamily, color: palette.textPrimary },
      tooltip: {
        trigger: 'item',
        valueFormatter: (v) => formatYen(Number(v)),
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
            name: d.key,
            value: d.amount,
            itemStyle: { color: colorMap[d.key] ?? palette.categorical[0] },
          })),
        },
      ],
    }),
    [data, colorMap],
  )

  return <EChart option={option} height={360} />
}
