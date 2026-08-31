import { useMemo, useState } from 'react'
import type { KickEvent } from '../types/match'
import { uniqueValues } from '../utils/aggregate'
import { KickFilters } from './KickFilters'
import { PitchChart } from './charts/PitchChart'

function sortRounds(rounds: string[]): string[] {
  return [...rounds].sort((a, b) => Number(a) - Number(b))
}

/**
 * キッキングチャート一式（シーズン/チーム/ラウンドのローカル絞り込み＋フィールド図）。
 * グローバルのチーム/シーズンSlicerとは独立して、この中で完結した状態を持つ。
 */
export function KickAnalysisSection({ kicks }: { kicks: KickEvent[] }) {
  const allSeasons = useMemo(() => [...uniqueValues(kicks, (k) => k.season)].sort(), [kicks])
  const [seasonOverride, setSeasonOverride] = useState('')
  const season = seasonOverride || allSeasons[allSeasons.length - 1] || ''

  const teamsInSeason = useMemo(
    () => [...uniqueValues(kicks.filter((k) => k.season === season), (k) => k.team)].sort(),
    [kicks, season],
  )
  const [teamOverride, setTeamOverride] = useState('')
  const team = teamOverride || teamsInSeason[0] || ''

  const roundsForSelection = useMemo(
    () => sortRounds(uniqueValues(kicks.filter((k) => k.season === season && k.team === team), (k) => k.round)),
    [kicks, season, team],
  )
  const [selectedRoundsOverride, setSelectedRoundsOverride] = useState<string[] | null>(null)
  const selectedRounds = selectedRoundsOverride ?? roundsForSelection

  const filteredKicks = useMemo(
    () =>
      kicks.filter((k) => k.season === season && k.team === team && selectedRounds.includes(k.round)),
    [kicks, season, team, selectedRounds],
  )

  return (
    <>
      <KickFilters
        seasons={allSeasons}
        season={season}
        onSeasonChange={(s) => {
          setSeasonOverride(s)
          setTeamOverride('')
          setSelectedRoundsOverride(null)
        }}
        teams={teamsInSeason}
        team={team}
        onTeamChange={(t) => {
          setTeamOverride(t)
          setSelectedRoundsOverride(null)
        }}
        rounds={roundsForSelection}
        selectedRounds={selectedRounds}
        onToggleRound={(round) => {
          const base = selectedRoundsOverride ?? roundsForSelection
          setSelectedRoundsOverride(
            base.includes(round) ? base.filter((r) => r !== round) : [...base, round],
          )
        }}
        onSelectAllRounds={() => setSelectedRoundsOverride(null)}
      />
      <div className="card">
        <h2>
          キッキングチャート（{team || '—'} / {selectedRounds.length}ラウンド分・{filteredKicks.length}本）
        </h2>
        <PitchChart kicks={filteredKicks} />
      </div>
    </>
  )
}
