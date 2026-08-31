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
  onSelectAllRounds: () => void
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
  onSelectAllRounds,
}: KickFiltersProps) {
  const allRoundsSelected = rounds.length > 0 && rounds.every((r) => selectedRounds.includes(r))

  return (
    <div className="slicer" role="group" aria-label="キック分析の絞り込み">
      <div className="slicer__group">
        <span className="slicer__label">シーズン</span>
        <select className="select" value={season} onChange={(e) => onSeasonChange(e.target.value)}>
          {seasons.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="slicer__group">
        <span className="slicer__label">チーム</span>
        <select className="select" value={team} onChange={(e) => onTeamChange(e.target.value)}>
          {teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="slicer__group">
        <span className="slicer__label">ラウンド</span>
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
      <button type="button" className="slicer__reset" onClick={onSelectAllRounds} disabled={allRoundsSelected}>
        全ラウンド表示
      </button>
    </div>
  )
}
