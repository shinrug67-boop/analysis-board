import { useMemo } from 'react'
import { EChart } from './EChart'
import type { EChartsOption } from './EChart'
import { palette, fontFamily } from '../../theme/palette'

const defaultValueFormatter = (v: number) => `${Math.round(v * 10) / 10}`

interface BarChartProps {
  data: { key: string; value: number }[]
  /** y軸名・ツールチップに使う単位ラベル（例: "本", "m"）。指定なしなら単位表示なし。 */
  unit?: string
  /** 値の整形（未指定なら小数を丸めて表示）。%表示など呼び出し側で自由に整形できる。 */
  valueFormatter?: (value: number) => string
}

/**
 * チーム比較用の汎用棒グラフ（トライ数・キャリー獲得メートル・スクラム/ラインアウト成功率などで共用）。
 * 系列は1つ（他の次元との掛け合わせがない）ため、単色（slot 1）で統一し、
 * カテゴリの識別はx軸ラベルに任せる。
 */
export function BarChart({ data, unit, valueFormatter }: BarChartProps) {
  const format = valueFormatter ?? defaultValueFormatter

  const option = useMemo<EChartsOption>(
    () => ({
      textStyle: { fontFamily, color: palette.textPrimary },
      grid: { left: 48, right: 16, top: 24, bottom: 72 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (v) => format(Number(v)),
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
        name: unit,
        axisLabel: { color: palette.muted, formatter: (v: number) => format(v) },
        splitLine: { lineStyle: { color: palette.gridline } },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.value),
          barMaxWidth: 24,
          itemStyle: { color: palette.categorical[0], borderRadius: [4, 4, 0, 0] },
        },
      ],
    }),
    [data, unit, format],
  )

  return <EChart option={option} height={360} />
}
