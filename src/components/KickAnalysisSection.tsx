import { useMemo, useState } from 'react'
import type { KickEvent } from '../types/match'
import { uniqueValues, KICK_IN_PLAY_PHASES } from '../utils/aggregate'
import { KICK_TYPE_ORDER } from '../theme/kickColors'
import { useLanguage } from '../i18n/LanguageContext'
import { KickFilters } from './KickFilters'
import { PitchChart } from './charts/PitchChart'
import { KickTypeBreakdown } from './KickTypeBreakdown'

function sortRounds(rounds: string[]): string[] {
  return [...rounds].sort((a, b) => Number(a) - Number(b))
}

/**
 * キッキングチャート一式（シーズン/チーム/ラウンドのローカル絞り込み＋フィールド図＋種別内訳）。
 * グローバルのチーム/シーズンSlicerとは独立して、この中で完結した状態を持つ。
 * ペナルティキックは対象外とし、Kick in Play / Kick in Play (Own 22) のみを扱う。
 */
export function KickAnalysisSection({ kicks }: { kicks: KickEvent[] }) {
  const { t } = useLanguage()
  const inPlayKicks = useMemo(() => kicks.filter((k) => KICK_IN_PLAY_PHASES.has(k.phase)), [kicks])

  const allSeasons = useMemo(() => [...uniqueValues(inPlayKicks, (k) => k.season)].sort(), [inPlayKicks])
  const [seasonOverride, setSeasonOverride] = useState('')
  const season = seasonOverride || allSeasons[allSeasons.length - 1] || ''

  const teamsInSeason = useMemo(
    () => [...uniqueValues(inPlayKicks.filter((k) => k.season === season), (k) => k.team)].sort(),
    [inPlayKicks, season],
  )
  const [teamOverride, setTeamOverride] = useState('')
  const team = teamOverride || teamsInSeason[0] || ''

  const roundsForSelection = useMemo(
    () =>
      sortRounds(uniqueValues(inPlayKicks.filter((k) => k.season === season && k.team === team), (k) => k.round)),
    [inPlayKicks, season, team],
  )
  const [selectedRoundsOverride, setSelectedRoundsOverride] = useState<string[] | null>(null)
  const selectedRounds = selectedRoundsOverride ?? roundsForSelection

  const filteredKicks = useMemo(
    () =>
      inPlayKicks.filter((k) => k.season === season && k.team === team && selectedRounds.includes(k.round)),
    [inPlayKicks, season, team, selectedRounds],
  )

  const [selectedTypesOverride, setSelectedTypesOverride] = useState<string[] | null>(null)
  const selectedTypes = selectedTypesOverride ?? KICK_TYPE_ORDER

  const pitchKicks = useMemo(
    () => filteredKicks.filter((k) => selectedTypes.includes(k.kickType)),
    [filteredKicks, selectedTypes],
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
        onToggleAllRounds={() => {
          const allSelected =
            roundsForSelection.length > 0 && roundsForSelection.every((r) => selectedRounds.includes(r))
          setSelectedRoundsOverride(allSelected ? [] : null)
        }}
      />
      <div className="card">
        <h2>
          {t('kickingChartHeading', {
            team: team || '—',
            rounds: selectedRounds.length,
            count: pitchKicks.length,
          })}
        </h2>
        <div className="kick-layout">
          <div className="kick-layout__pitch">
            <PitchChart kicks={pitchKicks} />
          </div>
          <div className="kick-layout__table">
            <KickTypeBreakdown
              kicks={filteredKicks}
              selectedTypes={selectedTypes}
              onToggleType={(kickType) => {
                const base = selectedTypesOverride ?? KICK_TYPE_ORDER
                setSelectedTypesOverride(
                  base.includes(kickType) ? base.filter((t) => t !== kickType) : [...base, kickType],
                )
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
