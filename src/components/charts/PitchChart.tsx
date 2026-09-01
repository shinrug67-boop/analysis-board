import { useMemo } from 'react'
import { EChart } from './EChart'
import type { EChartsOption } from './EChart'
import type { LinesSeriesOption } from 'echarts/charts'
import { palette, fontFamily } from '../../theme/palette'
import { getKickTypeColor } from '../../theme/kickColors'
import { useLanguage } from '../../i18n/LanguageContext'
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

// ゴールポスト（支柱間隔5.6m、ピッチ中央に設置）。平面図なので支柱は簡略化したH字の記号として描く。
const POST_HALF_WIDTH = 2.8
const POST_X: [number, number] = [34 - POST_HALF_WIDTH, 34 + POST_HALF_WIDTH]

type Point = [number, number]
type LabelOptions = { text: string; rotate?: number }

function segment(p1: Point, p2: Point, width: number, dashed = false, label?: LabelOptions) {
  return [
    {
      coord: p1,
      lineStyle: { width, type: dashed ? ('dashed' as const) : ('solid' as const) },
      ...(label
        ? {
            label: {
              show: true,
              formatter: label.text,
              rotate: label.rotate ?? 0,
              color: palette.pitch.line,
              fontSize: 11,
              fontWeight: 700 as const,
            },
          }
        : {}),
    },
    { coord: p2 },
  ]
}

// World Rugby規定のピッチライン＋ゴールポスト＋タッチライン沿いの目盛り。
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
  // 22mライン（ラベル付き）・ハーフウェー（実線）
  segment([FIELD_X[0], 22], [FIELD_X[1], 22], 1.5, false, { text: '22', rotate: 90 }),
  segment([FIELD_X[0], 78], [FIELD_X[1], 78], 1.5, false, { text: '22', rotate: 90 }),
  segment([FIELD_X[0], 50], [FIELD_X[1], 50], 1.5),
  // 10mライン（ハーフウェー前後、破線）
  segment([FIELD_X[0], 40], [FIELD_X[1], 40], 0.75, true),
  segment([FIELD_X[0], 60], [FIELD_X[1], 60], 0.75, true),
  // 5m/15mライン（タッチライン平行、フィールド内のみ・破線）
  segment([5, 0], [5, 100], 0.75, true),
  segment([15, 0], [15, 100], 0.75, true),
  segment([FIELD_X[1] - 5, 0], [FIELD_X[1] - 5, 100], 0.75, true),
  segment([FIELD_X[1] - 15, 0], [FIELD_X[1] - 15, 100], 0.75, true),
  // ゴールポスト（自陣）: 支柱2本+クロスバー
  segment([POST_X[0], 0], [POST_X[0], -6], 1.5),
  segment([POST_X[1], 0], [POST_X[1], -6], 1.5),
  segment([POST_X[0], -3], [POST_X[1], -3], 1.5),
  // ゴールポスト（敵陣）
  segment([POST_X[0], 100], [POST_X[0], 106], 1.5),
  segment([POST_X[1], 100], [POST_X[1], 106], 1.5),
  segment([POST_X[0], 103], [POST_X[1], 103], 1.5),
  // タッチライン沿いの目盛り（5/15/22/10m/ハーフウェー/78/85/95の位置を軽く示す短い目盛り線）
  ...[5, 15, 22, 40, 50, 60, 78, 85, 95].flatMap((y) => [
    segment([FIELD_X[0], y], [FIELD_X[0] + 2, y], 1),
    segment([FIELD_X[1] - 2, y], [FIELD_X[1], y], 1),
  ]),
]

// 上から下へのグラデーション（画面座標基準）。単色の芝生よりも矢印が視認しやすくなるよう
// 明暗をつけている。
function verticalGradient(light: string, dark: string) {
  return {
    type: 'linear' as const,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: light },
      { offset: 1, color: dark },
    ],
  }
}

const GRASS_STRIPE_LIGHT = verticalGradient(palette.pitch.grassStripeLightTop, palette.pitch.grassStripeLightBottom)
const GRASS_STRIPE_DARK = verticalGradient(palette.pitch.grassStripeDarkTop, palette.pitch.grassStripeDarkBottom)
const IN_GOAL_FILL = verticalGradient(palette.pitch.inGoalLight, palette.pitch.inGoalDark)

// モウィング（芝刈り）ストライプ。見た目の余白部分も含めキャンバス全体を緑で埋める
// （タッチライン際の"22"ラベルや、タッチを割ったキックの矢印の先が余白に落ちても
// 見えなくならないようにするため）。実際のフィールド境界はライン（枠線）の方で示す。
const STRIPE_COUNT = 9
const STRIPE_WIDTH = (AXIS_X[1] - AXIS_X[0]) / STRIPE_COUNT
const GRASS_STRIPES = Array.from({ length: STRIPE_COUNT }, (_, i) => [
  {
    coord: [AXIS_X[0] + i * STRIPE_WIDTH, AXIS_Y[0]] as Point,
    itemStyle: { color: i % 2 === 0 ? GRASS_STRIPE_LIGHT : GRASS_STRIPE_DARK },
  },
  { coord: [AXIS_X[0] + (i + 1) * STRIPE_WIDTH, AXIS_Y[1]] as Point },
])

// インゴールを少し濃い緑で塗り分ける（ストライプの上から重ねる）。
const PITCH_AREAS = [
  ...GRASS_STRIPES,
  [{ coord: [FIELD_X[0], DEAD_Y[0]], itemStyle: { color: IN_GOAL_FILL } }, { coord: [FIELD_X[1], 0] }],
  [{ coord: [FIELD_X[0], 100], itemStyle: { color: IN_GOAL_FILL } }, { coord: [FIELD_X[1], DEAD_Y[1]] }],
]

interface KickTooltipParams {
  data?: { value?: KickEvent }
}

/**
 * ラグビーフィールドを模したキッキングチャート（縦向き）。キックの開始座標→着地座標を矢印で描画する。
 * 座標系はOptaの定義どおり x:0(自陣ゴールライン)〜100(敵陣ゴールライン)、y:0〜68(タッチライン間)。
 * 縦向き表示のためxAxis=タッチライン方向(0-68)、yAxis=ピッチ長手方向(0-100)に割り当てている。
 * トライラインの外側にインゴール・デッドボールラインを描き、さらにその外側に余白を取っている。
 * モウィングストライプ・ゴールポスト・22mラベル・センターマークで実物のピッチ図に寄せている。
 * 矢印はキック種別（kickType）ごとに色分け（テーブルの色見本が凡例を兼ねる）。
 */
export function PitchChart({ kicks }: PitchChartProps) {
  const { t } = useLanguage()

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
            `${t('tooltipOutcome')}: ${kick.outcome}`,
            `${t('tooltipDistance')}: ${Math.round(kick.metres)}m`,
          ].join('<br/>')
        },
      },
      series: [
        {
          // ピッチの塗り（markArea）とライン（markLine）、中央マーク（markPoint）だけを描くための空系列。
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
          markPoint: {
            silent: true,
            symbol: 'circle',
            symbolSize: 5,
            itemStyle: { color: palette.pitch.line },
            label: { show: false },
            data: [{ coord: [34, 50] }] as never,
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
    [kicks, t],
  )

  return <EChart option={option} aspectRatio={`${AXIS_X[1] - AXIS_X[0]}/${AXIS_Y[1] - AXIS_Y[0]}`} />
}
