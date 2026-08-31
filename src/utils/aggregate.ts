import type { MatchTeamRow } from '../types/match'

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
    .map((team) => ({ key: team, tries: totals.get(team)! }))
    .sort((a, b) => b.tries - a.tries)
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

/** 列に含まれるユニーク値を初出順で返す（スライサーの選択肢生成用）。 */
export function uniqueValues(rows: MatchTeamRow[], keyFn: (row: MatchTeamRow) => string) {
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
