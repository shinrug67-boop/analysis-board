import { useLanguage } from '../i18n/LanguageContext'

interface KickFiltersProps {
  seasons: string[]
  season: string
  onSeasonChange: (season: string) => void
  teams: string[]
  team: string
  onTeamChange: (team: string) => void
  rounds: string[]
  selectedRounds: string[]
  onToggleRound: (round: string) => void
  /** 全ラウンド選択中なら全解除、そうでなければ全選択にするトグル。 */
  onToggleAllRounds: () => void
}

/**
 * キッキングチャート専用のローカル絞り込みUI（シーズン→チーム→ラウンド）。
 * グローバルのSlicerとは独立（ラウンド粒度はこのセクションでしか使わないため）。
 */
export function KickFilters({
  seasons,
  season,
  onSeasonChange,
  teams,
  team,
  onTeamChange,
  rounds,
  selectedRounds,
  onToggleRound,
  onToggleAllRounds,
}: KickFiltersProps) {
  const { t } = useLanguage()
  const allRoundsSelected = rounds.length > 0 && rounds.every((r) => selectedRounds.includes(r))

  return (
    <div className="slicer" role="group" aria-label={t('sectionKickingChart')}>
      <div className="slicer__group">
        <span className="slicer__label">{t('season')}</span>
        <select className="select" value={season} onChange={(e) => onSeasonChange(e.target.value)}>
          {seasons.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="slicer__group">
        <span className="slicer__label">{t('team')}</span>
        <select className="select" value={team} onChange={(e) => onTeamChange(e.target.value)}>
          {teams.map((teamOption) => (
            <option key={teamOption} value={teamOption}>
              {teamOption}
            </option>
          ))}
        </select>
      </div>
      <div className="slicer__group">
        <span className="slicer__label">{t('round')}</span>
        <div className="slicer__chips">
          {rounds.map((round) => (
            <button
              key={round}
              type="button"
              className={`chip ${selectedRounds.includes(round) ? 'is-active' : ''}`}
              aria-pressed={selectedRounds.includes(round)}
              onClick={() => onToggleRound(round)}
            >
              R{round}
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="slicer__reset" onClick={onToggleAllRounds} disabled={rounds.length === 0}>
        {allRoundsSelected ? t('hideAllRounds') : t('showAllRounds')}
      </button>
    </div>
  )
}
