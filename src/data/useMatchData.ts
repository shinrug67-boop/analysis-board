import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import type { MatchTeamRow } from '../types/match'

interface MatchDataState {
  rows: MatchTeamRow[]
  loading: boolean
  error: string | null
}

type RawRow = Record<
  | 'match_id' | 'date' | 'season' | 'round' | 'team' | 'opponent' | 'is_home'
  | 'own_score' | 'opp_score' | 'result'
  | 'tries'
  | 'tackles_attempted' | 'tackles_made' | 'tackle_success_rate'
  | 'carries' | 'carry_metres'
  | 'lineout_throws' | 'lineout_won' | 'lineout_success_rate'
  | 'scrum_attempts' | 'scrum_won' | 'scrum_success_rate'
  | 'turnovers_conceded' | 'turnovers_won'
  | 'penalties_conceded'
  | 'yellow_cards' | 'red_cards',
  string
>

function toNumberOrNull(value: string): number | null {
  return value === '' ? null : Number(value)
}

/** public/data/match_team_summary.csv をfetchしてパースし、型付きの試合成績データとして返すフック。 */
export function useMatchData(): MatchDataState {
  const [state, setState] = useState<MatchDataState>({ rows: [], loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    const csvUrl = `${import.meta.env.BASE_URL}data/match_team_summary.csv`

    fetch(csvUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`データの取得に失敗しました (HTTP ${res.status})`)
        return res.text()
      })
      .then((text) => {
        const parsed = Papa.parse<RawRow>(text, { header: true, skipEmptyLines: true })
        if (parsed.errors.length > 0) {
          throw new Error(parsed.errors[0]?.message ?? 'CSVの解析に失敗しました')
        }
        const rows: MatchTeamRow[] = parsed.data.map((r) => ({
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
        }))
        if (!cancelled) setState({ rows, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'データの読み込み中にエラーが発生しました'
          setState({ rows: [], loading: false, error: message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
