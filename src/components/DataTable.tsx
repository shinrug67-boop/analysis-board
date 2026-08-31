import { Table } from './Table'
import type { Column } from './Table'
import type { MatchTeamRow } from '../types/match'
import { formatPercent, formatMetres } from '../utils/format'

const RESULT_LABEL: Record<MatchTeamRow['result'], string> = { W: '勝ち', L: '負け', D: '分け' }

const COLUMNS: Column<MatchTeamRow>[] = [
  { key: 'date', label: '日付', sortValue: (r) => r.date, render: (r) => r.date },
  { key: 'team', label: 'チーム', sortValue: (r) => r.team, render: (r) => r.team },
  { key: 'opponent', label: '対戦相手', sortValue: (r) => r.opponent, render: (r) => r.opponent },
  { key: 'isHome', label: 'H/A', sortValue: (r) => r.isHome, render: (r) => (r.isHome ? 'H' : 'A') },
  {
    key: 'ownScore',
    label: 'スコア',
    align: 'right',
    sortValue: (r) => r.ownScore,
    render: (r) => `${r.ownScore} - ${r.oppScore}`,
  },
  { key: 'result', label: '勝敗', sortValue: (r) => r.result, render: (r) => RESULT_LABEL[r.result] },
  { key: 'tries', label: 'トライ', align: 'right', sortValue: (r) => r.tries, render: (r) => `${r.tries}` },
  {
    key: 'tackleSuccessRate',
    label: 'タックル成功率',
    align: 'right',
    sortValue: (r) => r.tackleSuccessRate,
    render: (r) => formatPercent(r.tackleSuccessRate),
  },
  {
    key: 'carryMetres',
    label: 'キャリー獲得m',
    align: 'right',
    sortValue: (r) => r.carryMetres,
    render: (r) => formatMetres(r.carryMetres),
  },
  {
    key: 'scrumSuccessRate',
    label: 'スクラム成功率',
    align: 'right',
    sortValue: (r) => r.scrumSuccessRate,
    render: (r) => formatPercent(r.scrumSuccessRate),
  },
  {
    key: 'lineoutSuccessRate',
    label: 'ラインアウト成功率',
    align: 'right',
    sortValue: (r) => r.lineoutSuccessRate,
    render: (r) => formatPercent(r.lineoutSuccessRate),
  },
  { key: 'turnoversWon', label: 'TO獲得', align: 'right', sortValue: (r) => r.turnoversWon, render: (r) => `${r.turnoversWon}` },
  {
    key: 'turnoversConceded',
    label: 'TO献上',
    align: 'right',
    sortValue: (r) => r.turnoversConceded,
    render: (r) => `${r.turnoversConceded}`,
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

/** 試合×チーム成績の明細テーブル。 */
export function DataTable({ rows }: { rows: MatchTeamRow[] }) {
  return (
    <Table
      columns={COLUMNS}
      rows={rows}
      rowKey={(row) => `${row.matchId}-${row.team}`}
      defaultSortKey="date"
      defaultSortDir="desc"
    />
  )
}
