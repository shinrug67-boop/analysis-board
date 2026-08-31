import { useMemo, useState } from 'react'
import type { SalesRow } from '../types/sales'
import { formatYen } from '../utils/format'

interface DataTableProps {
  rows: SalesRow[]
}

type SortKey = keyof SalesRow
type SortDir = 'asc' | 'desc'

const COLUMNS: { key: SortKey; label: string; align?: 'right' }[] = [
  { key: 'date', label: '日付' },
  { key: 'region', label: '地域' },
  { key: 'category', label: 'カテゴリ' },
  { key: 'product', label: '商品' },
  { key: 'amount', label: '売上額', align: 'right' },
  { key: 'quantity', label: '数量', align: 'right' },
]

const PAGE_SIZE = 20

/** 明細テーブル。列ヘッダのクリックでソート、下部の簡易ページネーションで表示件数を制御する。 */
export function DataTable({ rows }: DataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)

  // フィルタでrowsの参照が変わったら、レンダー中に1ページ目へ戻す
  // （エフェクトを使うと1テンポ遅れて古いページのまま一瞬再描画されるため）。
  const [rowsForPageReset, setRowsForPageReset] = useState(rows)
  if (rows !== rowsForPageReset) {
    setRowsForPageReset(rows)
    setPage(1)
  }

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageRows = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="data-table">
      <div className="data-table__scroll">
        <table>
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={col.align === 'right' ? 'is-right' : undefined}
                  aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {col.label}
                  {sortKey === col.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={`${row.date}-${row.product}-${i}`}>
                <td>{row.date}</td>
                <td>{row.region}</td>
                <td>{row.category}</td>
                <td>{row.product}</td>
                <td className="is-right is-tabular">{formatYen(row.amount)}</td>
                <td className="is-right is-tabular">{row.quantity.toLocaleString('ja-JP')}</td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="data-table__empty">
                  該当するデータがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="data-table__footer">
        <span>
          {sorted.length.toLocaleString('ja-JP')} 件中 {pageRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
          –{(currentPage - 1) * PAGE_SIZE + pageRows.length} 件を表示
        </span>
        <div className="data-table__pager">
          <button type="button" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
            前へ
          </button>
          <span>
            {currentPage} / {pageCount}
          </span>
          <button type="button" disabled={currentPage >= pageCount} onClick={() => setPage((p) => p + 1)}>
            次へ
          </button>
        </div>
      </div>
    </div>
  )
}
