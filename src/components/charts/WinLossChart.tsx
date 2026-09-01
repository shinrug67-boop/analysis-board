import { useMemo } from 'react'
import { EChart } from './EChart'
import type { EChartsOption } from './EChart'
import { palette, fontFamily } from '../../theme/palette'
import type { WinLossRow } from '../../utils/aggregate'
import { useLanguage } from '../../i18n/LanguageContext'
import type { TranslationKey } from '../../i18n/translations'

interface WinLossChartProps {
  /** utils/aggregate の winLossComparison() の結果（効果量の絶対値が大きい順）。 */
  data: WinLossRow[]
}

interface TooltipParams {
  dataIndex: number
}

/**
 * 勝ち試合・負け試合で各指標がどれだけ違うかを、効果量（Cohen's d）順の横棒で示すチャート。
 * 正（緑）＝勝ちに有利な方向、負（赤）＝直感に反して負け試合の方が高い、という向きに色分けする。
 * カテゴリ数が多い・ラベルが長いため横棒を採用し、上ほど「勝敗を分ける度合いが大きい」指標。
 */
export function WinLossChart({ data }: WinLossChartProps) {
  const { t } = useLanguage()

  const option = useMemo<EChartsOption>(
    () => {
      const metricLabel = (row: WinLossRow) => t(`metric_${row.key}` as TranslationKey)
      return {
      textStyle: { fontFamily, color: palette.textPrimary },
      grid: { left: 150, right: 24, top: 16, bottom: 32 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          const p = (Array.isArray(params) ? params[0] : params) as TooltipParams
          const row = data[p.dataIndex]
          if (!row) return ''
          return [
            `<strong>${metricLabel(row)}</strong>`,
            `${t('tooltipWinAvg')}: ${row.format(row.winAvg)}（n=${row.nWin}）`,
            `${t('tooltipLossAvg')}: ${row.format(row.lossAvg)}（n=${row.nLoss}）`,
            `${t('tooltipEffectSize')}: ${row.cohensD.toFixed(2)}`,
          ].join('<br/>')
        },
      },
      xAxis: {
        type: 'value',
        name: t('effectAxisName'),
        nameTextStyle: { color: palette.muted },
        axisLabel: { color: palette.muted },
        splitLine: { lineStyle: { color: palette.gridline } },
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: data.map(metricLabel),
        axisLine: { lineStyle: { color: palette.baseline } },
        axisTick: { show: false },
        axisLabel: { color: palette.textSecondary },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => ({
            value: Number(d.cohensD.toFixed(3)),
            itemStyle: { color: d.cohensD >= 0 ? palette.status.good : palette.status.critical },
          })),
          barMaxWidth: 20,
        },
      ],
      }
    },
    [data, t],
  )

  return <EChart option={option} height={Math.max(200, data.length * 34 + 48)} />
}
