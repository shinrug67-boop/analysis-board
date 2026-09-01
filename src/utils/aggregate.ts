import type { MatchTeamRow, PlayerMatchRow, KickEvent } from '../types/match'
import { formatPercent, formatMetres } from './format'

/** ペナルティキックを除いた「インプレーのキック」のphase。キッキングチャート・勝敗差分析で共通利用する。 */
export const KICK_IN_PLAY_PHASES = new Set(['Kick in Play', 'Kick in Play (Own 22)'])

/** チーム別のトライ数合計（棒グラフ用）。トライ数が多い順に並べる。 */
export function sumTriesByTeam(rows: MatchTeamRow[]) {
  const totals = new Map<string, number>()
  const order: string[] = []
  for (const row of rows) {
    if (!totals.has(row.team)) {
      totals.set(row.team, 0)
      order.push(row.team)
    }
    totals.set(row.team, totals.get(row.team)! + row.tries)
  }
  return order
    .map((team) => ({ key: team, value: totals.get(team)! }))
    .sort((a, b) => b.value - a.value)
}

/** チーム別の1試合あたり平均キャリー獲得メートル（棒グラフ用）。多い順に並べる。 */
export function avgCarryMetresByTeam(rows: MatchTeamRow[]) {
  const totals = new Map<string, { sum: number; count: number }>()
  const order: string[] = []
  for (const row of rows) {
    if (!totals.has(row.team)) {
      totals.set(row.team, { sum: 0, count: 0 })
      order.push(row.team)
    }
    const entry = totals.get(row.team)!
    entry.sum += row.carryMetres
    entry.count += 1
  }
  return order
    .map((team) => {
      const { sum, count } = totals.get(team)!
      return { key: team, value: count ? sum / count : 0 }
    })
    .sort((a, b) => b.value - a.value)
}

/**
 * チーム別の加重成功率（棒グラフ用）。1試合ごとの成功率の単純平均ではなく、
 * 分子・分母をチーム単位で合計してから割ることで、試行数の多い試合の影響を正しく反映する。
 * スクラム成功率・ラインアウト成功率のどちらもこの関数で計算する。
 */
export function weightedRateByTeam(
  rows: MatchTeamRow[],
  numerator: (row: MatchTeamRow) => number,
  denominator: (row: MatchTeamRow) => number,
) {
  const totals = new Map<string, { num: number; den: number }>()
  const order: string[] = []
  for (const row of rows) {
    if (!totals.has(row.team)) {
      totals.set(row.team, { num: 0, den: 0 })
      order.push(row.team)
    }
    const entry = totals.get(row.team)!
    entry.num += numerator(row)
    entry.den += denominator(row)
  }
  return order
    .map((team) => {
      const { num, den } = totals.get(team)!
      return { key: team, value: den ? num / den : 0 }
    })
    .sort((a, b) => b.value - a.value)
}

/** 日付別のタックル成功率の平均推移（折れ線グラフ用）。 */
export function avgTackleSuccessByDate(rows: MatchTeamRow[]) {
  const sums = new Map<string, { total: number; count: number }>()
  for (const row of rows) {
    if (row.tackleSuccessRate === null) continue
    const entry = sums.get(row.date) ?? { total: 0, count: 0 }
    entry.total += row.tackleSuccessRate
    entry.count += 1
    sums.set(row.date, entry)
  }
  return [...sums.entries()]
    .map(([date, { total, count }]) => ({ key: date, rate: total / count }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
}

/**
 * 勝敗内訳（ドーナツグラフ用）。表示順を W → L → D に固定する。
 * 表示名は持たない。keyを使って呼び出し側（i18n）で翻訳する。
 */
export function resultBreakdown(rows: MatchTeamRow[]) {
  const counts = { W: 0, L: 0, D: 0 }
  for (const row of rows) counts[row.result] += 1
  return [
    { key: 'W' as const, count: counts.W },
    { key: 'L' as const, count: counts.L },
    { key: 'D' as const, count: counts.D },
  ].filter((r) => r.count > 0)
}

/** 勝敗差分析（1行=1指標）の結果。表示名はkeyを使って呼び出し側（i18n）で翻訳する。 */
export interface WinLossRow {
  key: string
  format: (value: number) => string
  winAvg: number
  lossAvg: number
  /** 勝ちに有利な方向を正にそろえた差（元の単位）。higherIsBetter=falseの指標は符号を反転済み。 */
  advantage: number
  /** 効果量（Cohen's d）。advantageと同じ向きに符号をそろえている。単位に依存せず指標間で比較できる。 */
  cohensD: number
  nWin: number
  nLoss: number
}

/**
 * 試合×チームの行に、他ファイル（キックイベント）や同一試合の相手チーム行から導出した
 * 指標を合体させたもの。勝敗差分析はこちらを入力に取る。
 */
export interface ExtendedMatchRow extends MatchTeamRow {
  /** 相手チームの同一試合penaltiesConceded＝このチームが獲得したペナルティ数。 */
  penaltiesWon: number
  /** キャリー1回あたりの平均獲得メートル（carryMetres/carries）。carries=0ならnull。 */
  metresPerCarry: number | null
  /** インプレーキック（ペナルティキック除く）に占めるエラー系結果の割合。キックが0本ならnull。 */
  kickErrorRate: number | null
}

/**
 * MatchTeamRowにキックイベント由来・相手チーム由来の指標を合体させる。
 * 勝敗差分析でチーム集計CSVだけでは出せない指標（キックのミス率など）も扱えるようにするため。
 */
export function attachDerivedMetrics(rows: MatchTeamRow[], kicks: KickEvent[]): ExtendedMatchRow[] {
  const concededByMatch = new Map<string, Map<string, number>>()
  for (const row of rows) {
    if (!concededByMatch.has(row.matchId)) concededByMatch.set(row.matchId, new Map())
    concededByMatch.get(row.matchId)!.set(row.team, row.penaltiesConceded)
  }

  const kicksByMatchTeam = new Map<string, KickEvent[]>()
  for (const kick of kicks) {
    if (!KICK_IN_PLAY_PHASES.has(kick.phase)) continue
    const key = `${kick.matchId}__${kick.team}`
    if (!kicksByMatchTeam.has(key)) kicksByMatchTeam.set(key, [])
    kicksByMatchTeam.get(key)!.push(kick)
  }

  return rows.map((row) => {
    const penaltiesWon = concededByMatch.get(row.matchId)?.get(row.opponent) ?? 0
    const metresPerCarry = row.carries ? row.carryMetres / row.carries : null

    const teamKicks = kicksByMatchTeam.get(`${row.matchId}__${row.team}`) ?? []
    const errorKicks = teamKicks.filter((k) => k.outcome.startsWith('Error')).length
    const kickErrorRate = teamKicks.length ? errorKicks / teamKicks.length : null

    return { ...row, penaltiesWon, metresPerCarry, kickErrorRate }
  })
}

interface WinLossMetricDef {
  key: string
  higherIsBetter: boolean
  getValue: (row: ExtendedMatchRow) => number | null
  format: (value: number) => string
}

// labelは持たない。key（=i18nの`metric_${key}`）を使って表示側（WinLossChart/WinLossTable）で翻訳する。
const WIN_LOSS_METRICS: WinLossMetricDef[] = [
  { key: 'tries', higherIsBetter: true, getValue: (r) => r.tries, format: (v) => `${v.toFixed(1)}` },
  {
    key: 'tackleSuccessRate',
    higherIsBetter: true,
    getValue: (r) => r.tackleSuccessRate,
    format: formatPercent,
  },
  { key: 'carryMetres', higherIsBetter: true, getValue: (r) => r.carryMetres, format: formatMetres },
  {
    key: 'scrumSuccessRate',
    higherIsBetter: true,
    getValue: (r) => r.scrumSuccessRate,
    format: formatPercent,
  },
  {
    key: 'lineoutSuccessRate',
    higherIsBetter: true,
    getValue: (r) => r.lineoutSuccessRate,
    format: formatPercent,
  },
  {
    key: 'turnoversWon',
    higherIsBetter: true,
    getValue: (r) => r.turnoversWon,
    format: (v) => `${v.toFixed(1)}`,
  },
  {
    key: 'turnoversConceded',
    higherIsBetter: false,
    getValue: (r) => r.turnoversConceded,
    format: (v) => `${v.toFixed(1)}`,
  },
  {
    key: 'penaltiesConceded',
    higherIsBetter: false,
    getValue: (r) => r.penaltiesConceded,
    format: (v) => `${v.toFixed(1)}`,
  },
  {
    key: 'cards',
    higherIsBetter: false,
    getValue: (r) => r.yellowCards + r.redCards,
    format: (v) => `${v.toFixed(2)}`,
  },
  {
    key: 'penaltiesWon',
    higherIsBetter: true,
    getValue: (r) => r.penaltiesWon,
    format: (v) => `${v.toFixed(1)}`,
  },
  {
    key: 'metresPerCarry',
    higherIsBetter: true,
    getValue: (r) => r.metresPerCarry,
    format: (v) => `${v.toFixed(1)}m`,
  },
  {
    key: 'kickErrorRate',
    higherIsBetter: false,
    getValue: (r) => r.kickErrorRate,
    format: formatPercent,
  },
]

function meanAndVariance(values: number[]) {
  const n = values.length
  if (n === 0) return { mean: 0, variance: 0, n: 0 }
  const mean = values.reduce((a, b) => a + b, 0) / n
  const variance = n > 1 ? values.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1) : 0
  return { mean, variance, n }
}

/**
 * 勝ち試合と負け試合で各指標の平均がどれだけ違うかを比較する。
 * 単位が指標ごとに異なる（本/m/%）ため、標準偏差で正規化した効果量（Cohen's d）の絶対値が
 * 大きい順に並べる＝「勝敗を最も分ける指標」が上に来る。引き分けは対象外。
 */
export function winLossComparison(rows: ExtendedMatchRow[]): WinLossRow[] {
  const winRows = rows.filter((r) => r.result === 'W')
  const lossRows = rows.filter((r) => r.result === 'L')

  return WIN_LOSS_METRICS.map((metric) => {
    const winValues = winRows.map(metric.getValue).filter((v): v is number => v !== null)
    const lossValues = lossRows.map(metric.getValue).filter((v): v is number => v !== null)
    const w = meanAndVariance(winValues)
    const l = meanAndVariance(lossValues)

    const rawDiff = w.mean - l.mean
    const advantage = metric.higherIsBetter ? rawDiff : -rawDiff

    const pooledDf = w.n + l.n - 2
    const pooledVariance = pooledDf > 0 ? ((w.n - 1) * w.variance + (l.n - 1) * l.variance) / pooledDf : 0
    const pooledSd = Math.sqrt(pooledVariance)
    const cohensD = pooledSd > 0 ? advantage / pooledSd : 0

    return {
      key: metric.key,
      format: metric.format,
      winAvg: w.mean,
      lossAvg: l.mean,
      advantage,
      cohensD,
      nWin: w.n,
      nLoss: l.n,
    }
  }).sort((a, b) => Math.abs(b.cohensD) - Math.abs(a.cohensD))
}

/** 選手別ランキング（期間合計）の1行分。 */
export interface PlayerLeaderboardRow {
  player: string
  team: string
  matches: number
  minutesPlayed: number
  tries: number
  tacklesAttempted: number
  tacklesMade: number
  tackleSuccessRate: number | null
  turnoversForced: number
  carries: number
  carryMetres: number
  penaltiesConceded: number
  yellowCards: number
  redCards: number
}

/** 選手×試合の行を選手（かつチーム）単位に合計し、ランキング表示用の1行/選手に集約する。 */
export function playerLeaderboard(rows: PlayerMatchRow[]): PlayerLeaderboardRow[] {
  const totals = new Map<string, PlayerLeaderboardRow>()
  const order: string[] = []
  for (const row of rows) {
    const key = `${row.player}__${row.team}`
    if (!totals.has(key)) {
      totals.set(key, {
        player: row.player,
        team: row.team,
        matches: 0,
        minutesPlayed: 0,
        tries: 0,
        tacklesAttempted: 0,
        tacklesMade: 0,
        tackleSuccessRate: null,
        turnoversForced: 0,
        carries: 0,
        carryMetres: 0,
        penaltiesConceded: 0,
        yellowCards: 0,
        redCards: 0,
      })
      order.push(key)
    }
    const entry = totals.get(key)!
    entry.matches += 1
    entry.minutesPlayed += row.minutesPlayed ?? 0
    entry.tries += row.tries
    entry.tacklesAttempted += row.tacklesAttempted
    entry.tacklesMade += row.tacklesMade
    entry.turnoversForced += row.turnoversForced
    entry.carries += row.carries
    entry.carryMetres += row.carryMetres
    entry.penaltiesConceded += row.penaltiesConceded
    entry.yellowCards += row.yellowCards
    entry.redCards += row.redCards
  }
  return order
    .map((key) => {
      const entry = totals.get(key)!
      entry.tackleSuccessRate = entry.tacklesAttempted ? entry.tacklesMade / entry.tacklesAttempted : null
      return entry
    })
    .sort((a, b) => b.tries - a.tries)
}

/** 列に含まれるユニーク値を初出順で返す（スライサーの選択肢生成用）。 */
export function uniqueValues<T>(rows: T[], keyFn: (row: T) => string) {
  const seen = new Set<string>()
  const result: string[] = []
  for (const row of rows) {
    const value = keyFn(row)
    if (!seen.has(value)) {
      seen.add(value)
      result.push(value)
    }
  }
  return result
}
