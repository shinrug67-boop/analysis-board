import { useMemo } from 'react'
import { Table } from './Table'
import type { Column } from './Table'
import type { PlayerLeaderboardRow } from '../utils/aggregate'
import { formatPercent, formatMetres } from '../utils/format'
import { useLanguage } from '../i18n/LanguageContext'

/** 選手別ランキング表（期間合計）。デフォルトはトライ数の多い順。 */
export function PlayerTable({ rows }: { rows: PlayerLeaderboardRow[] }) {
  const { t } = useLanguage()

  const columns = useMemo<Column<PlayerLeaderboardRow>[]>(
    () => [
      { key: 'player', label: t('colPlayer'), sortValue: (r) => r.player, render: (r) => r.player },
      { key: 'team', label: t('colTeam'), sortValue: (r) => r.team, render: (r) => r.team },
      {
        key: 'matches',
        label: t('colMatches'),
        align: 'right',
        sortValue: (r) => r.matches,
        render: (r) => `${r.matches}`,
      },
      {
        key: 'minutesPlayed',
        label: t('colMinutesPlayed'),
        align: 'right',
        sortValue: (r) => r.minutesPlayed,
        render: (r) => `${Math.round(r.minutesPlayed)}${t('minutesSuffix')}`,
      },
      { key: 'tries', label: t('colTries'), align: 'right', sortValue: (r) => r.tries, render: (r) => `${r.tries}` },
      {
        key: 'tackleSuccessRate',
        label: t('colTackleSuccess'),
        align: 'right',
        sortValue: (r) => r.tackleSuccessRate,
        render: (r) => formatPercent(r.tackleSuccessRate),
      },
      {
        key: 'turnoversForced',
        label: t('colTurnoversForced'),
        align: 'right',
        sortValue: (r) => r.turnoversForced,
        render: (r) => `${r.turnoversForced}`,
      },
      {
        key: 'carries',
        label: t('colCarries'),
        align: 'right',
        sortValue: (r) => r.carries,
        render: (r) => `${r.carries}`,
      },
      {
        key: 'carryMetres',
        label: t('colCarryMetres'),
        align: 'right',
        sortValue: (r) => r.carryMetres,
        render: (r) => formatMetres(r.carryMetres),
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
    ],
    [t],
  )

  return (
    <Table
      columns={columns}
      rows={rows}
      rowKey={(row) => `${row.player}-${row.team}`}
      defaultSortKey="tries"
      defaultSortDir="desc"
    />
  )
}
