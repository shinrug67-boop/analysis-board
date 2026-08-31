/** マスターデータ1行分の売上レコード。public/data/sales.csv の列に対応する。 */
export interface SalesRow {
  date: string // YYYY-MM-DD
  region: string
  category: string
  product: string
  amount: number
  quantity: number
}

/** スライサーで選択中のフィルタ条件。配列が空 = その列は絞り込みなし（すべて表示）。 */
export interface FilterState {
  regions: string[]
  categories: string[]
}
