import { useMemo } from 'react'
import { Table } from './Table'
import type { Column } from './Table'
import type { DefenseRow } from '../utils/aggregate'
import { defenseLeaderboardTotal } from '../utils/aggregate'
import { formatPercent, formatAve } from '../utils/format'
import { getTeamShortName } from '../theme/teamColors'
import { useLanguage } from '../i18n/LanguageContext'

/**
 * チーム別ディフェンス集計表（タックル・ジャッカル・ペナルティ）。デフォルトはタックル成功率順。
 * 末尾に全チーム合計（加重平均・合計値）の固定行を表示する。
 */
export function DefenseTable({ rows }: { rows: DefenseRow[] }) {
  const { t } = useLanguage()
  const totalRow = useMemo(() => defenseLeaderboardTotal(rows), [rows])

  const columns = useMemo<Column<DefenseRow>[]>(
    () => [
      {
        key: 'team',
        label: t('colTeamShort'),
        sortValue: (r) => getTeamShortName(r.team),
        render: (r) => getTeamShortName(r.team),
      },
      {
        key: 'tackleAttemptAve',
        label: t('colTackleAttemptAve'),
        align: 'right',
        sortValue: (r) => r.tackleAttemptAve,
        render: (r) => formatAve(r.tackleAttemptAve),
      },
      {
        key: 'tackleSuccessRate',
        label: t('colTackleRate'),
        align: 'right',
        sortValue: (r) => r.tackleSuccessRate,
        render: (r) => formatPercent(r.tackleSuccessRate),
      },
      {
        key: 'tackleRank',
        label: t('colTackleRateRank'),
        align: 'right',
        sortValue: (r) => r.tackleRank,
        render: (r) => (r.tackleRank === null ? '—' : `${r.tackleRank}`),
      },
      {
        key: 'tacklesDominant',
        label: t('colTackleDom'),
        align: 'right',
        sortValue: (r) => r.tacklesDominant,
        render: (r) => `${r.tacklesDominant}`,
      },
      {
        key: 'tackleDominantAve',
        label: t('colTackleDomAve'),
        align: 'right',
        sortValue: (r) => r.tackleDominantAve,
        render: (r) => formatAve(r.tackleDominantAve),
      },
      {
        key: 'offloadAllowedTackles',
        label: t('colOffloadAllowed'),
        align: 'right',
        sortValue: (r) => r.offloadAllowedTackles,
        render: (r) => `${r.offloadAllowedTackles}`,
      },
      {
        key: 'offloadAllowedAve',
        label: t('colOffloadAllowedAve'),
        align: 'right',
        sortValue: (r) => r.offloadAllowedAve,
        render: (r) => formatAve(r.offloadAllowedAve),
      },
      {
        key: 'jackalAttempts',
        label: t('colJackal'),
        align: 'right',
        sortValue: (r) => r.jackalAttempts,
        render: (r) => `${r.jackalAttempts}`,
      },
      {
        key: 'jackalWon',
        label: t('colJackalWon'),
        align: 'right',
        sortValue: (r) => r.jackalWon,
        render: (r) => `${r.jackalWon}`,
      },
      {
        key: 'jackalWonAve',
        label: t('colJackalWonAve'),
        align: 'right',
        sortValue: (r) => r.jackalWonAve,
        render: (r) => formatAve(r.jackalWonAve),
      },
      {
        key: 'jackalSuccessRate',
        label: t('colJackalRate'),
        align: 'right',
        sortValue: (r) => r.jackalSuccessRate,
        render: (r) => formatPercent(r.jackalSuccessRate),
      },
      {
        key: 'turnoversWonTackle',
        label: t('colTurnoverWonTackle'),
        align: 'right',
        sortValue: (r) => r.turnoversWonTackle,
        render: (r) => `${r.turnoversWonTackle}`,
      },
      {
        key: 'penaltiesConceded',
        label: t('colPenalties'),
        align: 'right',
        sortValue: (r) => r.penaltiesConceded,
        render: (r) => `${r.penaltiesConceded}`,
      },
      {
        key: 'penaltiesConcededDefence',
        label: t('colPenaltiesDefence'),
        align: 'right',
        sortValue: (r) => r.penaltiesConcededDefence,
        render: (r) => `${r.penaltiesConcededDefence}`,
      },
    ],
    [t],
  )

  return (
    <Table
      columns={columns}
      rows={rows}
      rowKey={(row) => row.team}
      defaultSortKey="tackleSuccessRate"
      defaultSortDir="desc"
      pageSize={20}
      totalRow={{ ...totalRow, team: '', tackleRank: null }}
      totalRowLabel={t('total')}
    />
  )
}
