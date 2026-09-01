/**
 * アプリ全体のUI文言辞書。キーごとにja/enを持つ。
 * データそのもの（チーム名・選手名・キック種別など）はもともと英語表記のため翻訳対象外。
 */
const ja = {
  // --- アプリ全体 ---
  appSubtitle: 'ラグビー分析ダッシュボード（Japan Rugby League One D1）',
  loading: '読み込み中…',
  loadError: 'データの読み込みに失敗しました',
  langToggle: 'English',

  // --- グローバルスライサー ---
  team: 'チーム',
  season: 'シーズン',
  resetFilters: 'フィルタをリセット',
  filterGroupLabel: 'データの絞り込み',
  all: 'すべて',

  // --- セクション見出し ---
  sectionMatchDetails: '試合成績明細',
  sectionPlayerRanking: '選手成績ランキング（期間合計）',
  sectionKickingChart: 'キッキングチャート',
  sectionWinLoss: '勝敗差分析（勝ち試合 vs 負け試合）',

  // --- チームチャート見出し ---
  chartTriesByTeam: 'チーム別 トライ数合計',
  chartTackleTrend: '日別 タックル成功率推移',
  chartResultBreakdown: '勝敗内訳',
  chartCarryByTeam: 'チーム別 平均キャリー獲得m（1試合あたり）',
  chartScrumByTeam: 'チーム別 スクラム成功率',
  chartLineoutByTeam: 'チーム別 ラインアウト成功率',
  unitTries: '本',

  // --- 勝敗ラベル ---
  resultWin: '勝ち',
  resultLoss: '負け',
  resultDraw: '引き分け',

  // --- 試合成績明細（DataTable）列 ---
  colDate: '日付',
  colTeam: 'チーム',
  colOpponent: '対戦相手',
  colHomeAway: 'H/A',
  colScore: 'スコア',
  colResult: '勝敗',
  colTries: 'トライ',
  colTackleSuccess: 'タックル成功率',
  colCarryMetres: 'キャリー獲得m',
  colScrumSuccess: 'スクラム成功率',
  colLineoutSuccess: 'ラインアウト成功率',
  colTurnoversWon: 'TO獲得',
  colTurnoversConceded: 'TO献上',
  colPenalties: 'ペナルティ',
  colYellow: '黄',
  colRed: '赤',

  // --- 選手成績ランキング（PlayerTable）列 ---
  colPlayer: '選手',
  colMatches: '試合数',
  colMinutesPlayed: '出場時間',
  colTurnoversForced: 'TO奪取',
  colCarries: 'キャリー数',
  minutesSuffix: '分',

  // --- 勝敗差分析 ---
  winLossChartTitle: "効果量（Cohen's d）順 — 勝敗を最も分けている指標",
  winLossTableTitle: '指標別 詳細',
  effectAxisName: '効果量 (d)',
  tooltipWinAvg: '勝ち平均',
  tooltipLossAvg: '負け平均',
  tooltipEffectSize: '効果量(d)',
  colMetric: '指標',
  colWinAvg: '勝ち平均',
  colLossAvg: '負け平均',
  colAdvantage: '差（勝ちに有利な向き）',
  colNWin: 'n(勝)',
  colNLoss: 'n(負)',
  colEffectSize: '効果量(d)',
  colThreshold: '分岐点',
  colThresholdAccuracy: '的中率',

  metric_tries: 'トライ数',
  metric_tackleSuccessRate: 'タックル成功率',
  metric_carryMetres: 'キャリー獲得m',
  metric_scrumSuccessRate: 'スクラム成功率',
  metric_lineoutSuccessRate: 'ラインアウト成功率',
  metric_turnoversWon: 'ターンオーバー獲得',
  metric_turnoversConceded: 'ターンオーバー献上',
  metric_penaltiesConceded: 'ペナルティ',
  metric_cards: 'カード数（黄+赤）',
  metric_penaltiesWon: 'ペナルティ獲得',
  metric_metresPerCarry: 'キャリー1回あたり獲得m',
  metric_kickErrorRate: 'キックのミス率',
  metric_contestKickEffectiveRate: 'コンテストキック有効利用率（Box+Bomb）',
  metric_possessionShare: 'ボール保持率',
  metric_lineBreaks: 'ラインブレイク数',
  metric_entries22: '敵陣22m侵入回数',
  metric_entries22TryRate: '22m侵入→トライ転換率',

  // --- キッキングチャート ---
  round: 'ラウンド',
  showAllRounds: '全ラウンド表示',
  hideAllRounds: '全ラウンド解除',
  kickingChartHeading: 'キッキングチャート（{team} / {rounds}ラウンド分・表示中{count}本、Kick in Play系のみ）',
  colKickType: 'キック種別',
  colKickCount: '本数',
  colKickShare: '割合',
  colAvgDistance: '平均距離',

  // --- 汎用テーブル ---
  noData: '該当するデータがありません',
  paginationSummary: '{total}件中 {from}–{to} 件を表示',
  prevPage: '前へ',
  nextPage: '次へ',

  // --- PitchChartツールチップ ---
  tooltipOutcome: '結果',
  tooltipDistance: '距離',

  // --- PieChartツールチップ ---
  tooltipMatchesCount: '{n}試合',
} as const

type Dict = Record<keyof typeof ja, string>
const en: Dict = {
  appSubtitle: 'Rugby Analysis Dashboard (Japan Rugby League One D1)',
  loading: 'Loading…',
  loadError: 'Failed to load data',
  langToggle: '日本語',

  team: 'Team',
  season: 'Season',
  resetFilters: 'Reset filters',
  filterGroupLabel: 'Filter data',
  all: 'All',

  sectionMatchDetails: 'Match Details',
  sectionPlayerRanking: 'Player Ranking (Period Total)',
  sectionKickingChart: 'Kicking Chart',
  sectionWinLoss: 'Win/Loss Analysis (Wins vs Losses)',

  chartTriesByTeam: 'Total Tries by Team',
  chartTackleTrend: 'Daily Tackle Success Rate Trend',
  chartResultBreakdown: 'Win/Loss Breakdown',
  chartCarryByTeam: 'Avg Carry Metres by Team (per match)',
  chartScrumByTeam: 'Scrum Success Rate by Team',
  chartLineoutByTeam: 'Lineout Success Rate by Team',
  unitTries: 'tries',

  resultWin: 'Win',
  resultLoss: 'Loss',
  resultDraw: 'Draw',

  colDate: 'Date',
  colTeam: 'Team',
  colOpponent: 'Opponent',
  colHomeAway: 'H/A',
  colScore: 'Score',
  colResult: 'Result',
  colTries: 'Tries',
  colTackleSuccess: 'Tackle Success',
  colCarryMetres: 'Carry Metres',
  colScrumSuccess: 'Scrum Success',
  colLineoutSuccess: 'Lineout Success',
  colTurnoversWon: 'TOs Won',
  colTurnoversConceded: 'TOs Conceded',
  colPenalties: 'Penalties',
  colYellow: 'Yellow',
  colRed: 'Red',

  colPlayer: 'Player',
  colMatches: 'Matches',
  colMinutesPlayed: 'Minutes',
  colTurnoversForced: 'TOs Forced',
  colCarries: 'Carries',
  minutesSuffix: 'min',

  winLossChartTitle: "Ranked by effect size (Cohen's d) — metrics that separate wins from losses the most",
  winLossTableTitle: 'Detail by Metric',
  effectAxisName: 'Effect size (d)',
  tooltipWinAvg: 'Win avg',
  tooltipLossAvg: 'Loss avg',
  tooltipEffectSize: 'Effect size (d)',
  colMetric: 'Metric',
  colWinAvg: 'Win avg',
  colLossAvg: 'Loss avg',
  colAdvantage: 'Diff (favoring wins)',
  colNWin: 'n (win)',
  colNLoss: 'n (loss)',
  colEffectSize: 'Effect size (d)',
  colThreshold: 'Break-even point',
  colThresholdAccuracy: 'Accuracy',

  metric_tries: 'Tries',
  metric_tackleSuccessRate: 'Tackle success rate',
  metric_carryMetres: 'Carry metres',
  metric_scrumSuccessRate: 'Scrum success rate',
  metric_lineoutSuccessRate: 'Lineout success rate',
  metric_turnoversWon: 'Turnovers won',
  metric_turnoversConceded: 'Turnovers conceded',
  metric_penaltiesConceded: 'Penalties conceded',
  metric_cards: 'Cards (yellow+red)',
  metric_penaltiesWon: 'Penalties won',
  metric_metresPerCarry: 'Metres per carry',
  metric_kickErrorRate: 'Kick error rate',
  metric_contestKickEffectiveRate: 'Contestable kick effective rate (Box+Bomb)',
  metric_possessionShare: 'Possession share',
  metric_lineBreaks: 'Line breaks',
  metric_entries22: 'Attacking 22 entries',
  metric_entries22TryRate: '22 entry-to-try conversion rate',

  round: 'Round',
  showAllRounds: 'Show all rounds',
  hideAllRounds: 'Hide all rounds',
  kickingChartHeading: 'Kicking Chart ({team} / {rounds} round(s) · showing {count} kicks, in-play only)',
  colKickType: 'Kick type',
  colKickCount: 'Count',
  colKickShare: 'Share',
  colAvgDistance: 'Avg distance',

  noData: 'No matching data',
  paginationSummary: 'Showing {from}–{to} of {total}',
  prevPage: 'Prev',
  nextPage: 'Next',

  tooltipOutcome: 'Outcome',
  tooltipDistance: 'Distance',

  tooltipMatchesCount: '{n} matches',
}

export const translations = { ja, en } as const
export type Lang = keyof typeof translations
export type TranslationKey = keyof Dict
