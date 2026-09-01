import { useCsvData, toNumberOrNull } from './useCsvData'
import type { MatchTeamRow } from '../types/match'

/** public/data/match_team_summary.csv をfetchしてパースし、型付きの試合成績データとして返すフック。 */
export function useMatchData() {
  return useCsvData<MatchTeamRow>('match_team_summary.csv', (r) => ({
    matchId: r.match_id,
    date: r.date,
    season: r.season,
    round: r.round,
    team: r.team,
    opponent: r.opponent,
    isHome: r.is_home === 'Y',
    ownScore: Number(r.own_score),
    oppScore: Number(r.opp_score),
    result: r.result as MatchTeamRow['result'],
    tries: Number(r.tries),
    tacklesAttempted: Number(r.tackles_attempted),
    tacklesMade: Number(r.tackles_made),
    tackleSuccessRate: toNumberOrNull(r.tackle_success_rate),
    carries: Number(r.carries),
    carryMetres: Number(r.carry_metres),
    lineoutThrows: Number(r.lineout_throws),
    lineoutWon: Number(r.lineout_won),
    lineoutSuccessRate: toNumberOrNull(r.lineout_success_rate),
    scrumAttempts: Number(r.scrum_attempts),
    scrumWon: Number(r.scrum_won),
    scrumSuccessRate: toNumberOrNull(r.scrum_success_rate),
    turnoversConceded: Number(r.turnovers_conceded),
    turnoversWon: Number(r.turnovers_won),
    penaltiesConceded: Number(r.penalties_conceded),
    yellowCards: Number(r.yellow_cards),
    redCards: Number(r.red_cards),
    possessionSeconds: Number(r.possession_seconds),
    lineBreaks: Number(r.line_breaks),
    entries22: Number(r.entries_22),
    entries22Tries: Number(r.entries_22_tries),
  }))
}
