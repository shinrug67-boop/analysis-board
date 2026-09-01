import type { KickEvent } from '../types/match'
import { KICK_TYPE_ORDER, getKickTypeColor } from '../theme/kickColors'

interface KickTypeBreakdownProps {
  kicks: KickEvent[]
}

/**
 * キック種別ごとの内訳テーブル。件数が固定7種と少ないため、汎用Tableのソート/ページネーションは使わず
 * 件数の多い順に並べたシンプルな表にしている。色見本がPitchChartの矢印色の凡例を兼ねる。
 */
export function KickTypeBreakdown({ kicks }: KickTypeBreakdownProps) {
  const total = kicks.length
  const rows = KICK_TYPE_ORDER.map((kickType) => {
    const matched = kicks.filter((k) => k.kickType === kickType)
    const avgMetres = matched.length ? matched.reduce((sum, k) => sum + k.metres, 0) / matched.length : 0
    return { kickType, count: matched.length, avgMetres }
  })
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)

  return (
    <div className="data-table">
      <div className="data-table__scroll">
        <table>
          <thead>
            <tr>
              <th>キック種別</th>
              <th className="is-right">本数</th>
              <th className="is-right">割合</th>
              <th className="is-right">平均距離</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.kickType}>
                <td>
                  <span
                    className="kick-swatch"
                    style={{ backgroundColor: getKickTypeColor(r.kickType) }}
                    aria-hidden="true"
                  />
                  {r.kickType}
                </td>
                <td className="is-right is-tabular">{r.count.toLocaleString('ja-JP')}</td>
                <td className="is-right is-tabular">{total ? `${((r.count / total) * 100).toFixed(1)}%` : '—'}</td>
                <td className="is-right is-tabular">{Math.round(r.avgMetres)}m</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="data-table__empty">
                  該当するキックがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
