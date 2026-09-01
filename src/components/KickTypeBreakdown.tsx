import type { KickEvent } from '../types/match'
import { KICK_TYPE_ORDER, getKickTypeColor } from '../theme/kickColors'
import { useLanguage } from '../i18n/LanguageContext'

interface KickTypeBreakdownProps {
  kicks: KickEvent[]
  selectedTypes: string[]
  onToggleType: (kickType: string) => void
}

/**
 * キック種別ごとの内訳テーブル。件数が固定7種と少ないため、汎用Tableのソート/ページネーションは使わず
 * 件数の多い順に並べたシンプルな表にしている。色見本がPitchChartの矢印色の凡例を兼ねる。
 * 行をクリックするとその種別の選択状態がトグルされ、左のPitchChartの表示に連動する。
 */
export function KickTypeBreakdown({ kicks, selectedTypes, onToggleType }: KickTypeBreakdownProps) {
  const { t, lang } = useLanguage()
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
        <table className="kick-type-table">
          <thead>
            <tr>
              <th>{t('colKickType')}</th>
              <th className="is-right">{t('colKickCount')}</th>
              <th className="is-right">{t('colKickShare')}</th>
              <th className="is-right">{t('colAvgDistance')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.kickType}
                className={selectedTypes.includes(r.kickType) ? 'is-active' : ''}
                onClick={() => onToggleType(r.kickType)}
                role="button"
                tabIndex={0}
                aria-pressed={selectedTypes.includes(r.kickType)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onToggleType(r.kickType)
                  }
                }}
              >
                <td>
                  <span
                    className="kick-swatch"
                    style={{ backgroundColor: getKickTypeColor(r.kickType) }}
                    aria-hidden="true"
                  />
                  {r.kickType}
                </td>
                <td className="is-right is-tabular">
                  {r.count.toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US')}
                </td>
                <td className="is-right is-tabular">{total ? `${((r.count / total) * 100).toFixed(1)}%` : '—'}</td>
                <td className="is-right is-tabular">{Math.round(r.avgMetres)}m</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="data-table__empty">
                  {t('noData')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
