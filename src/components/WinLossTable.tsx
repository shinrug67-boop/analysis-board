import { useMemo } from 'react'
import { Table } from './Table'
import type { Column } from './Table'
import type { WinLossRow } from '../utils/aggregate'
import { useLanguage, type TFunction } from '../i18n/LanguageContext'
import type { TranslationKey } from '../i18n/translations'

function metricLabel(t: TFunction, row: WinLossRow): string {
  return t(`metric_${row.key}` as TranslationKey)
}

function formatAdvantage(row: WinLossRow): string {
  const sign = row.advantage >= 0 ? '+' : '-'
  return `${sign}${row.format(Math.abs(row.advantage))}`
}

/** 勝敗差分析の詳細数値テーブル。デフォルトは効果量の大きい順。 */
export function WinLossTable({ rows }: { rows: WinLossRow[] }) {
  const { t } = useLanguage()

  const columns = useMemo<Column<WinLossRow>[]>(
    () => [
      { key: 'label', label: t('colMetric'), sortValue: (r) => metricLabel(t, r), render: (r) => metricLabel(t, r) },
      {
        key: 'winAvg',
        label: t('colWinAvg'),
        align: 'right',
        sortValue: (r) => r.winAvg,
        render: (r) => r.format(r.winAvg),
      },
      {
        key: 'lossAvg',
        label: t('colLossAvg'),
        align: 'right',
        sortValue: (r) => r.lossAvg,
        render: (r) => r.format(r.lossAvg),
      },
      {
        key: 'advantage',
        label: t('colAdvantage'),
        align: 'right',
        sortValue: (r) => r.advantage,
        render: formatAdvantage,
      },
      { key: 'nWin', label: t('colNWin'), align: 'right', sortValue: (r) => r.nWin, render: (r) => `${r.nWin}` },
      { key: 'nLoss', label: t('colNLoss'), align: 'right', sortValue: (r) => r.nLoss, render: (r) => `${r.nLoss}` },
      {
        key: 'cohensD',
        label: t('colEffectSize'),
        align: 'right',
        sortValue: (r) => Math.abs(r.cohensD),
        render: (r) => r.cohensD.toFixed(2),
      },
    ],
    [t],
  )

  return <Table columns={columns} rows={rows} rowKey={(row) => row.key} defaultSortKey="cohensD" defaultSortDir="desc" />
}
