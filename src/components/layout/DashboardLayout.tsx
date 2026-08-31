import type { ReactNode } from 'react'

/** ダッシュボード全体の骨格。ヘッダーの下に、渡された各セクションを縦に並べる。 */
export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>Analysis Board</h1>
        <p>ラグビー分析ダッシュボード（Japan Rugby League One D1）</p>
      </header>
      {children}
    </div>
  )
}
