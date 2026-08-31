import { useCsvData } from './useCsvData'
import type { KickEvent } from '../types/match'

/** public/data/kick_events.csv をfetchしてパースし、型付きのキックイベント一覧として返すフック。 */
export function useKickEvents() {
  return useCsvData<KickEvent>('kick_events.csv', (r) => ({
    matchId: r.match_id,
    date: r.date,
    season: r.season,
    round: r.round,
    team: r.team,
    opponent: r.opponent,
    player: r.player,
    x: Number(r.x),
    y: Number(r.y),
    xEnd: Number(r.x_end),
    yEnd: Number(r.y_end),
    kickType: r.kick_type,
    phase: r.phase,
    outcome: r.outcome,
    metres: Number(r.metres),
  }))
}
