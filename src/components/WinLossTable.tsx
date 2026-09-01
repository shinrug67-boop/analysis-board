import { Table } from './Table'
import type { Column } from './Table'
import type { WinLossRow } from '../utils/aggregate'

function formatAdvantage(row: WinLossRow): string {
  const sign = row.advantage >= 0 ? '+' : '-'
  return `${sign}${row.format(Math.abs(row.advantage))}`
}

const COLUMNS: Column<WinLossRow>[] = [
  { key: 'label', label: '指標', sortValue: (r) => r.label, render: (r) => r.label },
  { key: 'winAvg', label: '勝ち平均', align: 'right', sortValue: (r) => r.winAvg, render: (r) => r.format(r.winAvg) },
  { key: 'lossAvg', label: '負け平均', align: 'right', sortValue: (r) => r.lossAvg, render: (r) => r.format(r.lossAvg) },
  {
    key: 'advantage',
    label: '差（勝ちに有利な向き）',
    align: 'right',
    sortValue: (r) => r.advantage,
    render: formatAdvantage,
  },
  { key: 'nWin', label: 'n(勝)', align: 'right', sortValue: (r) => r.nWin, render: (r) => `${r.nWin}` },
  { key: 'nLoss', label: 'n(負)', align: 'right', sortValue: (r) => r.nLoss, render: (r) => `${r.nLoss}` },
  {
    key: 'cohensD',
    label: '効果量(d)',
    align: 'right',
    sortValue: (r) => Math.abs(r.cohensD),
    render: (r) => r.cohensD.toFixed(2),
  },
]

/** 勝敗差分析の詳細数値テーブル。デフォルトは効果量の大きい順。 */
export function WinLossTable({ rows }: { rows: WinLossRow[] }) {
  return <Table columns={COLUMNS} rows={rows} rowKey={(row) => row.key} defaultSortKey="cohensD" defaultSortDir="desc" />
}
