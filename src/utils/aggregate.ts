import type { MatchTeamRow, PlayerMatchRow } from '../types/match'

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

/** 勝敗内訳（ドーナツグラフ用）。表示順を W → L → D に固定する。 */
export function resultBreakdown(rows: MatchTeamRow[]) {
  const counts = { W: 0, L: 0, D: 0 }
  for (const row of rows) counts[row.result] += 1
  return [
    { key: 'W' as const, label: '勝ち', count: counts.W },
    { key: 'L' as const, label: '負け', count: counts.L },
    { key: 'D' as const, label: '引き分け', count: counts.D },
  ].filter((r) => r.count > 0)
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
