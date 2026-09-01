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
 * 勝ち/負けどちらかが0件で比較不能な指標（cohensD=null）はチャートには出さない
 * （詳細テーブル側には「—」として残る）。
 */
export function WinLossChart({ data }: WinLossChartProps) {
  const { t } = useLanguage()
  const comparableData = useMemo(() => data.filter((d) => d.cohensD !== null), [data])

  const option = useMemo<EChartsOption>(
    () => {
      const metricLabel = (row: WinLossRow) => t(`metric_${row.key}` as TranslationKey)
      return {
      textStyle: { fontFamily, color: palette.textPrimary },
      grid: { left: 300, right: 24, top: 16, bottom: 32 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          const p = (Array.isArray(params) ? params[0] : params) as TooltipParams
          const row = comparableData[p.dataIndex]
          if (!row || row.winAvg === null || row.lossAvg === null || row.cohensD === null) return ''
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
        data: comparableData.map(metricLabel),
        axisLine: { lineStyle: { color: palette.baseline } },
        axisTick: { show: false },
        axisLabel: { color: palette.textSecondary },
      },
      series: [
        {
          type: 'bar',
          data: comparableData.map((d) => ({
            value: Number((d.cohensD ?? 0).toFixed(3)),
            itemStyle: { color: (d.cohensD ?? 0) >= 0 ? palette.status.good : palette.status.critical },
          })),
          barMaxWidth: 20,
        },
      ],
      }
    },
    [comparableData, t],
  )

  return <EChart option={option} height={Math.max(200, comparableData.length * 34 + 48)} />
}
