import type { SalesRow } from '../types/sales'

/** 指定キーでグルーピングし、amount/quantity を合計する。表示順は初出順を維持する。 */
function sumBy(rows: SalesRow[], keyFn: (row: SalesRow) => string) {
  const order: string[] = []
  const totals = new Map<string, { amount: number; quantity: number }>()

  for (const row of rows) {
    const key = keyFn(row)
    if (!totals.has(key)) {
      totals.set(key, { amount: 0, quantity: 0 })
      order.push(key)
    }
    const entry = totals.get(key)!
    entry.amount += row.amount
    entry.quantity += row.quantity
  }

  return order.map((key) => ({ key, ...totals.get(key)! }))
}

/** 地域別の売上合計（棒グラフ用）。 */
export function sumByRegion(rows: SalesRow[]) {
  return sumBy(rows, (r) => r.region)
}

/** カテゴリ別の売上合計（円グラフ用）。 */
export function sumByCategory(rows: SalesRow[]) {
  return sumBy(rows, (r) => r.category)
}

/** 日付順に並べた日別売上合計（折れ線グラフ用）。 */
export function sumByDate(rows: SalesRow[]) {
  const grouped = sumBy(rows, (r) => r.date)
  return grouped.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
}

/** 列に含まれるユニーク値を初出順で返す（スライサーの選択肢生成用）。 */
export function uniqueValues(rows: SalesRow[], keyFn: (row: SalesRow) => string) {
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
