import { useFilters } from '../state/FilterContext'
import { useLanguage } from '../i18n/LanguageContext'

interface SlicerProps {
  teams: string[]
  seasons: string[]
  opponents: string[]
}

/**
 * チーム・シーズン・対戦相手を絞り込むスライサー。チャート・テーブルより上の1行に置き、
 * 選択状態はFilterContext経由でダッシュボード全体に反映される。
 */
export function Slicer({ teams, seasons, opponents }: SlicerProps) {
  const { filters, toggleTeam, toggleSeason, toggleOpponent, reset } = useFilters()
  const { t } = useLanguage()
  const hasActiveFilter =
    filters.teams.length > 0 || filters.seasons.length > 0 || filters.opponents.length > 0

  return (
    <div className="slicer" role="group" aria-label={t('filterGroupLabel')}>
      <div className="slicer__group">
        <span className="slicer__label">{t('season')}</span>
        <div className="slicer__chips">
          {seasons.map((season) => (
            <button
              key={season}
              type="button"
              className={`chip ${filters.seasons.includes(season) ? 'is-active' : ''}`}
              aria-pressed={filters.seasons.includes(season)}
              onClick={() => toggleSeason(season)}
            >
              {season}
            </button>
          ))}
        </div>
      </div>
      <div className="slicer__group">
        <span className="slicer__label">{t('team')}</span>
        <div className="slicer__chips">
          {teams.map((team) => (
            <button
              key={team}
              type="button"
              className={`chip ${filters.teams.includes(team) ? 'is-active' : ''}`}
              aria-pressed={filters.teams.includes(team)}
              onClick={() => toggleTeam(team)}
            >
              {team}
            </button>
          ))}
        </div>
      </div>
      <div className="slicer__group">
        <span className="slicer__label">{t('colOpponent')}</span>
        <div className="slicer__chips">
          {opponents.map((opponent) => (
            <button
              key={opponent}
              type="button"
              className={`chip ${filters.opponents.includes(opponent) ? 'is-active' : ''}`}
              aria-pressed={filters.opponents.includes(opponent)}
              onClick={() => toggleOpponent(opponent)}
            >
              {opponent}
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="slicer__reset" onClick={reset} disabled={!hasActiveFilter}>
        {t('resetFilters')}
      </button>
    </div>
  )
}
