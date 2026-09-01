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

// 座標系（縦向き表示）: xAxis=タッチライン方向(0-68)、yAxis=トライライン方向(0-100)。
// トライラインの外側 -10〜0 / 100〜110 がインゴール（デッドボールラインまで）。
// さらにその外側に見た目の余白を持たせるため、軸の描画範囲自体は少し広めに取っている。
const FIELD_X: [number, number] = [0, 68]
const DEAD_Y: [number, number] = [-10, 110]
const MARGIN = 8
const AXIS_X: [number, number] = [FIELD_X[0] - MARGIN, FIELD_X[1] + MARGIN]
const AXIS_Y: [number, number] = [DEAD_Y[0] - MARGIN, DEAD_Y[1] + MARGIN]

type Point = [number, number]

function segment(p1: Point, p2: Point, width: number, dashed = false) {
  return [
    { coord: p1, lineStyle: { width, type: dashed ? ('dashed' as const) : ('solid' as const) } },
    { coord: p2 },
  ]
}

// World Rugby規定のピッチライン。
const PITCH_LINES = [
  // タッチライン（インゴールの側面まで含めて全長）
  segment([FIELD_X[0], DEAD_Y[0]], [FIELD_X[0], DEAD_Y[1]], 1.5),
  segment([FIELD_X[1], DEAD_Y[0]], [FIELD_X[1], DEAD_Y[1]], 1.5),
  // トライライン（ゴールライン）
  segment([FIELD_X[0], 0], [FIELD_X[1], 0], 1.5),
  segment([FIELD_X[0], 100], [FIELD_X[1], 100], 1.5),
  // デッドボールライン
  segment([FIELD_X[0], DEAD_Y[0]], [FIELD_X[1], DEAD_Y[0]], 1),
  segment([FIELD_X[0], DEAD_Y[1]], [FIELD_X[1], DEAD_Y[1]], 1),
  // 22mライン・ハーフウェー（実線）
  segment([FIELD_X[0], 22], [FIELD_X[1], 22], 1.5),
  segment([FIELD_X[0], 78], [FIELD_X[1], 78], 1.5),
  segment([FIELD_X[0], 50], [FIELD_X[1], 50], 1.5),
  // 10mライン（ハーフウェー前後、破線）
  segment([FIELD_X[0], 40], [FIELD_X[1], 40], 0.75, true),
  segment([FIELD_X[0], 60], [FIELD_X[1], 60], 0.75, true),
  // 5m/15mライン（タッチライン平行、フィールド内のみ・破線）
  segment([5, 0], [5, 100], 0.75, true),
  segment([15, 0], [15, 100], 0.75, true),
  segment([FIELD_X[1] - 5, 0], [FIELD_X[1] - 5, 100], 0.75, true),
  segment([FIELD_X[1] - 15, 0], [FIELD_X[1] - 15, 100], 0.75, true),
]

// 芝生（ピッチ+インゴール）と、インゴールを少し濃い緑で塗り分けるための領域。
const PITCH_AREAS = [
  [{ coord: [FIELD_X[0], DEAD_Y[0]], itemStyle: { color: palette.pitch.grass } }, { coord: [FIELD_X[1], DEAD_Y[1]] }],
  [{ coord: [FIELD_X[0], DEAD_Y[0]], itemStyle: { color: palette.pitch.inGoal } }, { coord: [FIELD_X[1], 0] }],
  [{ coord: [FIELD_X[0], 100], itemStyle: { color: palette.pitch.inGoal } }, { coord: [FIELD_X[1], DEAD_Y[1]] }],
]

interface KickTooltipParams {
  data?: { value?: KickEvent }
}

/**
 * ラグビーフィールドを模したキッキングチャート（縦向き）。キックの開始座標→着地座標を矢印で描画する。
 * 座標系はOptaの定義どおり x:0(自陣ゴールライン)〜100(敵陣ゴールライン)、y:0〜68(タッチライン間)。
 * 縦向き表示のためxAxis=タッチライン方向(0-68)、yAxis=ピッチ長手方向(0-100)に割り当てている。
 * トライラインの外側にインゴール・デッドボールラインを描き、さらにその外側に余白を取っている。
 * 矢印はキック種別（kickType）ごとに色分け（テーブルの色見本が凡例を兼ねる）。
 */
export function PitchChart({ kicks }: PitchChartProps) {
  const option = useMemo<EChartsOption>(
    () => ({
      textStyle: { fontFamily, color: palette.textPrimary },
      grid: { left: 16, right: 16, top: 16, bottom: 16, show: false },
      xAxis: { type: 'value', min: AXIS_X[0], max: AXIS_X[1], show: false },
      yAxis: { type: 'value', min: AXIS_Y[0], max: AXIS_Y[1], show: false },
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
          // ピッチの塗り（markArea）とライン（markLine）だけを描くための空系列。
          type: 'line',
          data: [],
          showSymbol: false,
          silent: true,
          lineStyle: { opacity: 0 },
          markArea: {
            silent: true,
            data: PITCH_AREAS as never,
          },
          markLine: {
            silent: true,
            symbol: 'none',
            label: { show: false },
            lineStyle: { color: palette.pitch.line },
            data: PITCH_LINES as never,
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
              opacity: k.kickType === 'Touch Kick' ? 0.95 : 0.8,
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

  return <EChart option={option} aspectRatio={`${AXIS_X[1] - AXIS_X[0]}/${AXIS_Y[1] - AXIS_Y[0]}`} />
}
