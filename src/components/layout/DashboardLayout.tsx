import type { ReactNode } from 'react'

interface DashboardLayoutProps {
  filters: ReactNode
  charts: ReactNode
  table: ReactNode
}

/** ダッシュボード全体の骨格。ヘッダー→フィルタ行→チャート群→明細テーブルの順に並べる。 */
export function DashboardLayout({ filters, charts, table }: DashboardLayoutProps) {
  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>Analysis Board</h1>
        <p>売上データダッシュボード（サンプルデータ）</p>
      </header>
      <section className="dashboard__filters">{filters}</section>
      <section className="dashboard__charts">{charts}</section>
      <section className="dashboard__table">{table}</section>
    </div>
  )
}
