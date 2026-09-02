import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

export interface Column<T> {
  key: string
  label: string
  align?: 'right'
  /** ソート用の比較値（文字列・数値・真偽値・null）を返す。 */
  sortValue: (row: T) => string | number | boolean | null
  /** セル表示内容（通常は文字列。色見本など軽い装飾が必要な列はReactNodeを返してもよい）。 */
  render: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  defaultSortKey: string
  defaultSortDir?: 'asc' | 'desc'
  pageSize?: number
  /** 指定すると、ソート・ページネーションの影響を受けない「合計」行を末尾に固定表示する。 */
  totalRow?: T
  /** totalRow の左端ラベル（例:「合計」）。totalRow指定時は必須。 */
  totalRowLabel?: string
}

function compareValues(a: string | number | boolean | null, b: string | number | boolean | null): number {
  if (a === null || b === null) return a === b ? 0 : a === null ? -1 : 1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)
  return String(a).localeCompare(String(b))
}

/**
 * 汎用テーブル（列ソート・簡易ページネーション）。試合成績明細・選手ランキング表など、
 * 行の型に依存しないよう columns/rows/rowKey を props 化している。
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  defaultSortKey,
  defaultSortDir = 'desc',
  pageSize = 20,
  totalRow,
  totalRowLabel,
}: TableProps<T>) {
  const { t, lang } = useLanguage()
  const [sortKey, setSortKey] = useState(defaultSortKey)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSortDir)
  const [page, setPage] = useState(1)

  // フィルタでrowsの参照が変わったら、レンダー中に1ページ目へ戻す
  // （エフェクトを使うと1テンポ遅れて古いページのまま一瞬再描画されるため）。
  const [rowsForPageReset, setRowsForPageReset] = useState(rows)
  if (rows !== rowsForPageReset) {
    setRowsForPageReset(rows)
    setPage(1)
  }

  const sortColumn = columns.find((c) => c.key === sortKey) ?? columns[0]

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const cmp = compareValues(sortColumn.sortValue(a), sortColumn.sortValue(b))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, sortColumn, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function handleSort(key: string) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <div className="data-table">
      <div className="data-table__scroll">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
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
            {pageRows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((col) => (
                  <td key={col.key} className={col.align === 'right' ? 'is-right is-tabular' : undefined}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="data-table__empty">
                  {t('noData')}
                </td>
              </tr>
            )}
          </tbody>
          {totalRow !== undefined && (
            <tfoot>
              <tr className="data-table__total-row">
                {columns.map((col, i) => (
                  <td key={col.key} className={col.align === 'right' ? 'is-right is-tabular' : undefined}>
                    {i === 0 ? totalRowLabel : col.render(totalRow)}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <div className="data-table__footer">
        <span>
          {t('paginationSummary', {
            total: sorted.length.toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US'),
            from: pageRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1,
            to: (currentPage - 1) * pageSize + pageRows.length,
          })}
        </span>
        <div className="data-table__pager">
          <button type="button" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
            {t('prevPage')}
          </button>
          <span>
            {currentPage} / {pageCount}
          </span>
          <button type="button" disabled={currentPage >= pageCount} onClick={() => setPage((p) => p + 1)}>
            {t('nextPage')}
          </button>
        </div>
      </div>
    </div>
  )
}
