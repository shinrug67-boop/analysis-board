import { useFilters } from '../state/FilterContext'

interface SlicerProps {
  teams: string[]
  seasons: string[]
}

/**
 * チーム・シーズンを絞り込むスライサー。チャート・テーブルより上の1行に置き、
 * 選択状態はFilterContext経由でダッシュボード全体に反映される。
 */
export function Slicer({ teams, seasons }: SlicerProps) {
  const { filters, toggleTeam, toggleSeason, reset } = useFilters()
  const hasActiveFilter = filters.teams.length > 0 || filters.seasons.length > 0

  return (
    <div className="slicer" role="group" aria-label="データの絞り込み">
      <div className="slicer__group">
        <span className="slicer__label">シーズン</span>
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
        <span className="slicer__label">チーム</span>
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
      <button type="button" className="slicer__reset" onClick={reset} disabled={!hasActiveFilter}>
        フィルタをリセット
      </button>
    </div>
  )
}
