import { useMemo } from 'react'
import { Table } from './Table'
import type { Column } from './Table'
import type { MatchTeamRow } from '../types/match'
import { formatPercent, formatMetres } from '../utils/format'
import { useLanguage } from '../i18n/LanguageContext'

/** 試合×チーム成績の明細テーブル。 */
export function DataTable({ rows }: { rows: MatchTeamRow[] }) {
  const { t } = useLanguage()

  const columns = useMemo<Column<MatchTeamRow>[]>(
    () => {
      const resultLabel: Record<MatchTeamRow['result'], string> = {
        W: t('resultWin'),
        L: t('resultLoss'),
        D: t('resultDraw'),
      }
      return [
      { key: 'date', label: t('colDate'), sortValue: (r) => r.date, render: (r) => r.date },
      { key: 'team', label: t('colTeam'), sortValue: (r) => r.team, render: (r) => r.team },
      { key: 'opponent', label: t('colOpponent'), sortValue: (r) => r.opponent, render: (r) => r.opponent },
      { key: 'isHome', label: t('colHomeAway'), sortValue: (r) => r.isHome, render: (r) => (r.isHome ? 'H' : 'A') },
      {
        key: 'ownScore',
        label: t('colScore'),
        align: 'right',
        sortValue: (r) => r.ownScore,
        render: (r) => `${r.ownScore} - ${r.oppScore}`,
      },
      { key: 'result', label: t('colResult'), sortValue: (r) => r.result, render: (r) => resultLabel[r.result] },
      { key: 'tries', label: t('colTries'), align: 'right', sortValue: (r) => r.tries, render: (r) => `${r.tries}` },
      {
        key: 'tackleSuccessRate',
        label: t('colTackleSuccess'),
        align: 'right',
        sortValue: (r) => r.tackleSuccessRate,
        render: (r) => formatPercent(r.tackleSuccessRate),
      },
      {
        key: 'carryMetres',
        label: t('colCarryMetres'),
        align: 'right',
        sortValue: (r) => r.carryMetres,
        render: (r) => formatMetres(r.carryMetres),
      },
      {
        key: 'scrumSuccessRate',
        label: t('colScrumSuccess'),
        align: 'right',
        sortValue: (r) => r.scrumSuccessRate,
        render: (r) => formatPercent(r.scrumSuccessRate),
      },
      {
        key: 'lineoutSuccessRate',
        label: t('colLineoutSuccess'),
        align: 'right',
        sortValue: (r) => r.lineoutSuccessRate,
        render: (r) => formatPercent(r.lineoutSuccessRate),
      },
      {
        key: 'turnoversWon',
        label: t('colTurnoversWon'),
        align: 'right',
        sortValue: (r) => r.turnoversWon,
        render: (r) => `${r.turnoversWon}`,
      },
      {
        key: 'turnoversConceded',
        label: t('colTurnoversConceded'),
        align: 'right',
        sortValue: (r) => r.turnoversConceded,
        render: (r) => `${r.turnoversConceded}`,
      },
      {
        key: 'penaltiesConceded',
        label: t('colPenalties'),
        align: 'right',
        sortValue: (r) => r.penaltiesConceded,
        render: (r) => `${r.penaltiesConceded}`,
      },
      {
        key: 'yellowCards',
        label: t('colYellow'),
        align: 'right',
        sortValue: (r) => r.yellowCards,
        render: (r) => `${r.yellowCards}`,
      },
      {
        key: 'redCards',
        label: t('colRed'),
        align: 'right',
        sortValue: (r) => r.redCards,
        render: (r) => `${r.redCards}`,
      },
      ]
    },
    [t],
  )

  return (
    <Table
      columns={columns}
      rows={rows}
      rowKey={(row) => `${row.matchId}-${row.team}`}
      defaultSortKey="date"
      defaultSortDir="desc"
    />
  )
}
