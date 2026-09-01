import { useMemo } from 'react'
import { EChart } from './EChart'
import type { EChartsOption } from './EChart'
import type { LinesSeriesOption } from 'echarts/charts'
import { palette, fontFamily } from '../../theme/palette'
import { getKickTypeColor } from '../../theme/kickColors'
import type { KickEvent } from '../../types/match'

interface PitchChartProps {
  kicks: KickEvent[]
}

// ピッチの横線（自陣ゴールライン=0 → 敵陣ゴールライン=100、単位はメートル相当）。
// 縦向き表示のため、pitch長手方向はyAxis側の水平線として描く。
// 22m/ハーフウェーはやや太く、5m/15mラインは細く描く。
const PITCH_LINES = [
  { yAxis: 5, lineStyle: { width: 0.75 } },
  { yAxis: 15, lineStyle: { width: 0.75 } },
  { yAxis: 22, lineStyle: { width: 1.5 } },
  { yAxis: 50, lineStyle: { width: 1.5 } },
  { yAxis: 78, lineStyle: { width: 1.5 } },
  { yAxis: 85, lineStyle: { width: 0.75 } },
  { yAxis: 95, lineStyle: { width: 0.75 } },
]

interface KickTooltipParams {
  data?: { value?: KickEvent }
}

/**
 * ラグビーフィールドを模したキッキングチャート（縦向き）。キックの開始座標→着地座標を矢印で描画する。
 * 座標系はOptaの定義どおり x:0(自陣ゴールライン)〜100(敵陣ゴールライン)、y:0〜68(タッチライン間)。
 * 縦向き表示のためxAxis=タッチライン方向(0-68)、yAxis=ピッチ長手方向(0-100)に割り当てている。
 * 矢印はキック種別（kickType）ごとに色分け（テーブルの色見本が凡例を兼ねる）。
 */
export function PitchChart({ kicks }: PitchChartProps) {
  const option = useMemo<EChartsOption>(
    () => ({
      textStyle: { fontFamily, color: palette.textPrimary },
      grid: {
        left: 16,
        right: 16,
        top: 16,
        bottom: 16,
        show: true,
        backgroundColor: palette.pitch.grass,
        borderColor: palette.pitch.border,
        borderWidth: 1,
      },
      xAxis: { type: 'value', min: 0, max: 68, show: false },
      yAxis: { type: 'value', min: 0, max: 100, show: false },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const kick = (params as KickTooltipParams).data?.value
          if (!kick) return ''
          return [
            `<strong>${kick.player}</strong>`,
            `${kick.kickType}（${kick.phase}）`,
            `結果: ${kick.outcome}`,
            `距離: ${Math.round(kick.metres)}m`,
          ].join('<br/>')
        },
      },
      series: [
        {
          // ピッチのライン（5m/15m/22m/ハーフウェー）だけを描くための空系列。
          type: 'line',
          data: [],
          showSymbol: false,
          silent: true,
          lineStyle: { opacity: 0 },
          markLine: {
            silent: true,
            symbol: 'none',
            label: { show: false },
            lineStyle: { color: palette.pitch.line },
            data: PITCH_LINES,
          },
        },
        {
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          // valueにKickEvent全体を積んでツールチップで読み出す(echarts自体は実行時に任意の
          // 追加フィールドを許容するが、型定義は数値/配列前提のためここだけ型を緩めている)。
          data: kicks.map((k) => ({
            coords: [
              [k.y, k.x],
              [k.yEnd, k.xEnd],
            ],
            lineStyle: {
              color: getKickTypeColor(k.kickType),
              opacity: k.kickType === 'Touch Kick' ? 0.6 : 0.4,
            },
            value: k,
          })) as unknown as LinesSeriesOption['data'],
          lineStyle: { width: 1.5, curveness: 0 },
          symbol: ['none', 'arrow'],
          symbolSize: 8,
        },
      ],
    }),
    [kicks],
  )

  return <EChart option={option} aspectRatio="68/100" />
}
