import { useMemo, useState } from 'react'
import type { MatchTeamRow } from '../types/match'
import { formatPercent, formatMetres } from '../utils/format'

interface DataTableProps {
  rows: MatchTeamRow[]
}

type SortKey = keyof MatchTeamRow
type SortDir = 'asc' | 'desc'

interface Column {
  key: SortKey
  label: string
  align?: 'right'
  render: (row: MatchTeamRow) => string
}

const COLUMNS: Column[] = [
  { key: 'date', label: '日付', render: (r) => r.date },
  { key: 'team', label: 'チーム', render: (r) => r.team },
  { key: 'opponent', label: '対戦相手', render: (r) => r.opponent },
  { key: 'isHome', label: 'H/A', render: (r) => (r.isHome ? 'H' : 'A') },
  { key: 'ownScore', label: 'スコア', align: 'right', render: (r) => `${r.ownScore} - ${r.oppScore}` },
  { key: 'result', label: '勝敗', render: (r) => ({ W: '勝ち', L: '負け', D: '分け' })[r.result] },
  { key: 'tries', label: 'トライ', align: 'right', render: (r) => `${r.tries}` },
  { key: 'tackleSuccessRate', label: 'タックル成功率', align: 'right', render: (r) => formatPercent(r.tackleSuccessRate) },
  { key: 'carryMetres', label: 'キャリー獲得m', align: 'right', render: (r) => formatMetres(r.carryMetres) },
  { key: 'scrumSuccessRate', label: 'スクラム成功率', align: 'right', render: (r) => formatPercent(r.scrumSuccessRate) },
  { key: 'lineoutSuccessRate', label: 'ラインアウト成功率', align: 'right', render: (r) => formatPercent(r.lineoutSuccessRate) },
  { key: 'turnoversWon', label: 'TO獲得', align: 'right', render: (r) => `${r.turnoversWon}` },
  { key: 'turnoversConceded', label: 'TO献上', align: 'right', render: (r) => `${r.turnoversConceded}` },
  { key: 'penaltiesConceded', label: 'ペナルティ', align: 'right', render: (r) => `${r.penaltiesConceded}` },
  { key: 'yellowCards', label: '黄', align: 'right', render: (r) => `${r.yellowCards}` },
  { key: 'redCards', label: '赤', align: 'right', render: (r) => `${r.redCards}` },
]

const PAGE_SIZE = 20

function compareValues(a: MatchTeamRow[SortKey], b: MatchTeamRow[SortKey]): number {
  if (a === null || b === null) return a === b ? 0 : a === null ? -1 : 1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)
  return String(a).localeCompare(String(b))
}

/** 試合×チーム成績の明細テーブル。列ヘッダのクリックでソート、下部の簡易ページネーションで表示件数を制御する。 */
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
      const cmp = compareValues(a[sortKey], b[sortKey])
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
            {pageRows.map((row) => (
              <tr key={`${row.matchId}-${row.team}`}>
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className={col.align === 'right' ? 'is-right is-tabular' : undefined}
                  >
                    {col.render(row)}
                  </td>
                ))}
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
