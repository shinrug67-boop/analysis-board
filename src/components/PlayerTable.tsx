import { Table } from './Table'
import type { Column } from './Table'
import type { PlayerLeaderboardRow } from '../utils/aggregate'
import { formatPercent, formatMetres } from '../utils/format'

const COLUMNS: Column<PlayerLeaderboardRow>[] = [
  { key: 'player', label: '選手', sortValue: (r) => r.player, render: (r) => r.player },
  { key: 'team', label: 'チーム', sortValue: (r) => r.team, render: (r) => r.team },
  { key: 'matches', label: '試合数', align: 'right', sortValue: (r) => r.matches, render: (r) => `${r.matches}` },
  {
    key: 'minutesPlayed',
    label: '出場時間',
    align: 'right',
    sortValue: (r) => r.minutesPlayed,
    render: (r) => `${Math.round(r.minutesPlayed)}分`,
  },
  { key: 'tries', label: 'トライ', align: 'right', sortValue: (r) => r.tries, render: (r) => `${r.tries}` },
  {
    key: 'tackleSuccessRate',
    label: 'タックル成功率',
    align: 'right',
    sortValue: (r) => r.tackleSuccessRate,
    render: (r) => formatPercent(r.tackleSuccessRate),
  },
  {
    key: 'turnoversForced',
    label: 'TO奪取',
    align: 'right',
    sortValue: (r) => r.turnoversForced,
    render: (r) => `${r.turnoversForced}`,
  },
  { key: 'carries', label: 'キャリー数', align: 'right', sortValue: (r) => r.carries, render: (r) => `${r.carries}` },
  {
    key: 'carryMetres',
    label: 'キャリー獲得m',
    align: 'right',
    sortValue: (r) => r.carryMetres,
    render: (r) => formatMetres(r.carryMetres),
  },
  {
    key: 'penaltiesConceded',
    label: 'ペナルティ',
    align: 'right',
    sortValue: (r) => r.penaltiesConceded,
    render: (r) => `${r.penaltiesConceded}`,
  },
  { key: 'yellowCards', label: '黄', align: 'right', sortValue: (r) => r.yellowCards, render: (r) => `${r.yellowCards}` },
  { key: 'redCards', label: '赤', align: 'right', sortValue: (r) => r.redCards, render: (r) => `${r.redCards}` },
]

/** 選手別ランキング表（期間合計）。デフォルトはトライ数の多い順。 */
export function PlayerTable({ rows }: { rows: PlayerLeaderboardRow[] }) {
  return (
    <Table
      columns={COLUMNS}
      rows={rows}
      rowKey={(row) => `${row.player}-${row.team}`}
      defaultSortKey="tries"
      defaultSortDir="desc"
    />
  )
}
