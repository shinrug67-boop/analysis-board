import { useCsvData, toNumberOrNull } from './useCsvData'
import type { PlayerMatchRow } from '../types/match'

/** public/data/match_player_summary.csv をfetchしてパースし、型付きの選手成績データとして返すフック。 */
export function usePlayerMatchData() {
  return useCsvData<PlayerMatchRow>('match_player_summary.csv', (r) => ({
    matchId: r.match_id,
    date: r.date,
    season: r.season,
    round: r.round,
    team: r.team,
    opponent: r.opponent,
    player: r.player,
    position: r.position,
    shirtNumber: r.shirt_number,
    minutesPlayed: toNumberOrNull(r.minutes_played),
    tries: Number(r.tries),
    tacklesAttempted: Number(r.tackles_attempted),
    tacklesMade: Number(r.tackles_made),
    tackleSuccessRate: toNumberOrNull(r.tackle_success_rate),
    turnoversForced: Number(r.turnovers_forced),
    carries: Number(r.carries),
    carryMetres: Number(r.carry_metres),
    penaltiesConceded: Number(r.penalties_conceded),
    yellowCards: Number(r.yellow_cards),
    redCards: Number(r.red_cards),
  }))
}
