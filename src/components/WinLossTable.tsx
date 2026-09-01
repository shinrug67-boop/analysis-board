import { useMemo } from 'react'
import { Table } from './Table'
import type { Column } from './Table'
import type { WinLossRow } from '../utils/aggregate'
import { formatPercent } from '../utils/format'
import { useLanguage, type TFunction } from '../i18n/LanguageContext'
import type { TranslationKey } from '../i18n/translations'

function metricLabel(t: TFunction, row: WinLossRow): string {
  return t(`metric_${row.key}` as TranslationKey)
}

function formatValue(row: WinLossRow, value: number | null): string {
  return value === null ? '—' : row.format(value)
}

function formatAdvantage(row: WinLossRow): string {
  if (row.advantage === null) return '—'
  const sign = row.advantage >= 0 ? '+' : '-'
  return `${sign}${row.format(Math.abs(row.advantage))}`
}

function formatThreshold(row: WinLossRow): string {
  if (row.threshold === null) return '—'
  const symbol = row.thresholdDirection === '>=' ? '≥' : '≤'
  return `${symbol} ${row.format(row.threshold)}`
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
        render: (r) => formatValue(r, r.winAvg),
      },
      {
        key: 'lossAvg',
        label: t('colLossAvg'),
        align: 'right',
        sortValue: (r) => r.lossAvg,
        render: (r) => formatValue(r, r.lossAvg),
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
        sortValue: (r) => (r.cohensD === null ? null : Math.abs(r.cohensD)),
        render: (r) => (r.cohensD === null ? '—' : r.cohensD.toFixed(2)),
      },
      {
        key: 'threshold',
        label: t('colThreshold'),
        align: 'right',
        sortValue: (r) => r.threshold,
        render: formatThreshold,
      },
      {
        key: 'thresholdAccuracy',
        label: t('colThresholdAccuracy'),
        align: 'right',
        sortValue: (r) => r.thresholdAccuracy,
        render: (r) => (r.thresholdAccuracy === null ? '—' : formatPercent(r.thresholdAccuracy)),
      },
    ],
    [t],
  )

  return <Table columns={columns} rows={rows} rowKey={(row) => row.key} defaultSortKey="cohensD" defaultSortDir="desc" />
}
