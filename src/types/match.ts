/**
 * 試合×チーム単位の集計データ1行分。public/data/match_team_summary.csv の列に対応する。
 * 生成元: scripts/build_summaries.py（Opta生イベントログからの集計、指標定義もそちらを参照）。
 */
export interface MatchTeamRow {
  matchId: string
  date: string // YYYY-MM-DD
  season: string
  round: string
  team: string
  opponent: string
  isHome: boolean
  ownScore: number
  oppScore: number
  result: 'W' | 'L' | 'D'
  tries: number
  tacklesAttempted: number
  tacklesMade: number
  tackleSuccessRate: number | null
  carries: number
  carryMetres: number
  lineoutThrows: number
  lineoutWon: number
  lineoutSuccessRate: number | null
  scrumAttempts: number
  scrumWon: number
  scrumSuccessRate: number | null
  turnoversConceded: number
  turnoversWon: number
  penaltiesConceded: number
  /** 自陣防御中に犯したペナルティ数（Penalty Conceded かつ qualifier3Name=="Defence"）。 */
  penaltiesConcededDefence: number
  yellowCards: number
  redCards: number
  /** ボール保持時間（秒）。Opta Possessionイベントの継続時間合計。 */
  possessionSeconds: number
  /** ラインブレイク数（Attacking Qualities × Initial Break）。 */
  lineBreaks: number
  /** 敵陣22m侵入回数。 */
  entries22: number
  /** 敵陣22m侵入がトライに至った回数。 */
  entries22Tries: number
  /** ドミナントタックル数（qualifier4Name=="Dominant Tackle"）。 */
  tacklesDominant: number
  /** タックルしたがオフロードを許した回数（ActionResultName=="Offload Allowed"）。 */
  offloadAllowedTackles: number
  /** ジャッカル（ブレイクダウンでのボール奪取）試行数（Collection × ActionTypeName=="Jackal"）。 */
  jackalAttempts: number
  /** ジャッカル成功数（ActionResultName=="Success"）。 */
  jackalWon: number
  /** タックルからそのままターンオーバーを奪った回数（Tackle × ActionResultName=="Turnover Won"）。 */
  turnoversWonTackle: number
}

/** 試合×選手単位の集計データ1行分。public/data/match_player_summary.csv の列に対応する。 */
export interface PlayerMatchRow {
  matchId: string
  date: string
  season: string
  round: string
  team: string
  opponent: string
  player: string
  position: string
  shirtNumber: string
  minutesPlayed: number | null
  tries: number
  tacklesAttempted: number
  tacklesMade: number
  tackleSuccessRate: number | null
  turnoversForced: number
  carries: number
  carryMetres: number
  penaltiesConceded: number
  yellowCards: number
  redCards: number
}

/** キックイベント1行分（1キック=1行）。public/data/kick_events.csv の列に対応する。 */
export interface KickEvent {
  matchId: string
  date: string
  season: string
  round: string
  team: string
  opponent: string
  player: string
  x: number
  y: number
  xEnd: number
  yEnd: number
  kickType: string
  phase: string
  outcome: string
  metres: number
}

/** スライサーで選択中のフィルタ条件。配列が空 = その列は絞り込みなし（すべて表示）。 */
export interface FilterState {
  teams: string[]
  seasons: string[]
  opponents: string[]
}
