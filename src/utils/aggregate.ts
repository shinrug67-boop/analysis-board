import type { MatchTeamRow, PlayerMatchRow, KickEvent } from '../types/match'
import { formatPercent, formatMetres } from './format'

/** ペナルティキックを除いた「インプレーのキック」のphase。キッキングチャート・勝敗差分析で共通利用する。 */
export const KICK_IN_PLAY_PHASES = new Set(['Kick in Play', 'Kick in Play (Own 22)'])

/** チーム別のトライ数合計（棒グラフ用）。トライ数が多い順に並べる。 */
export function sumTriesByTeam(rows: MatchTeamRow[]) {
  const totals = new Map<string, number>()
  const order: string[] = []
  for (const row of rows) {
    if (!totals.has(row.team)) {
      totals.set(row.team, 0)
      order.push(row.team)
    }
    totals.set(row.team, totals.get(row.team)! + row.tries)
  }
  return order
    .map((team) => ({ key: team, value: totals.get(team)! }))
    .sort((a, b) => b.value - a.value)
}

/** チーム別の1試合あたり平均キャリー獲得メートル（棒グラフ用）。多い順に並べる。 */
export function avgCarryMetresByTeam(rows: MatchTeamRow[]) {
  const totals = new Map<string, { sum: number; count: number }>()
  const order: string[] = []
  for (const row of rows) {
    if (!totals.has(row.team)) {
      totals.set(row.team, { sum: 0, count: 0 })
      order.push(row.team)
    }
    const entry = totals.get(row.team)!
    entry.sum += row.carryMetres
    entry.count += 1
  }
  return order
    .map((team) => {
      const { sum, count } = totals.get(team)!
      return { key: team, value: count ? sum / count : 0 }
    })
    .sort((a, b) => b.value - a.value)
}

/**
 * チーム別の加重成功率（棒グラフ用）。1試合ごとの成功率の単純平均ではなく、
 * 分子・分母をチーム単位で合計してから割ることで、試行数の多い試合の影響を正しく反映する。
 * スクラム成功率・ラインアウト成功率のどちらもこの関数で計算する。
 */
export function weightedRateByTeam(
  rows: MatchTeamRow[],
  numerator: (row: MatchTeamRow) => number,
  denominator: (row: MatchTeamRow) => number,
) {
  const totals = new Map<string, { num: number; den: number }>()
  const order: string[] = []
  for (const row of rows) {
    if (!totals.has(row.team)) {
      totals.set(row.team, { num: 0, den: 0 })
      order.push(row.team)
    }
    const entry = totals.get(row.team)!
    entry.num += numerator(row)
    entry.den += denominator(row)
  }
  return order
    .map((team) => {
      const { num, den } = totals.get(team)!
      return { key: team, value: den ? num / den : 0 }
    })
    .sort((a, b) => b.value - a.value)
}

/** 日付別のタックル成功率の平均推移（折れ線グラフ用）。 */
export function avgTackleSuccessByDate(rows: MatchTeamRow[]) {
  const sums = new Map<string, { total: number; count: number }>()
  for (const row of rows) {
    if (row.tackleSuccessRate === null) continue
    const entry = sums.get(row.date) ?? { total: 0, count: 0 }
    entry.total += row.tackleSuccessRate
    entry.count += 1
    sums.set(row.date, entry)
  }
  return [...sums.entries()]
    .map(([date, { total, count }]) => ({ key: date, rate: total / count }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
}

/**
 * 勝敗内訳（ドーナツグラフ用）。表示順を W → L → D に固定する。
 * 表示名は持たない。keyを使って呼び出し側（i18n）で翻訳する。
 */
export function resultBreakdown(rows: MatchTeamRow[]) {
  const counts = { W: 0, L: 0, D: 0 }
  for (const row of rows) counts[row.result] += 1
  return [
    { key: 'W' as const, count: counts.W },
    { key: 'L' as const, count: counts.L },
    { key: 'D' as const, count: counts.D },
  ].filter((r) => r.count > 0)
}

/** 勝敗差分析（1行=1指標）の結果。表示名はkeyを使って呼び出し側（i18n）で翻訳する。 */
export interface WinLossRow {
  key: string
  format: (value: number) => string
  /** 勝ち試合の平均。nWin=0（該当試合が無い）ならnull。 */
  winAvg: number | null
  /** 負け試合の平均。nLoss=0ならnull。 */
  lossAvg: number | null
  /**
   * 勝ちに有利な方向を正にそろえた差（元の単位）。higherIsBetter=falseの指標は符号を反転済み。
   * 勝ち・負けどちらかの試合が0件で比較不能な場合はnull（例: 特定の対戦相手に全勝/全敗しているケース）。
   */
  advantage: number | null
  /** 効果量（Cohen's d）。advantageと同じ向きに符号をそろえている。単位に依存せず指標間で比較できる。比較不能ならnull。 */
  cohensD: number | null
  nWin: number
  nLoss: number
  /**
   * 勝敗を最もよく分ける分岐点（しきい値）。「この値の側にいれば勝ち/負けと予測すると
   * 一番当たる」という単純な1変数ルールの最適な境界を全データから探索して求める。
   * 全試合が同じ値などデータが1点しかない場合はnull。
   */
  threshold: number | null
  /** thresholdをどちら向きに読むか（higherIsBetter=trueなら'>='、falseなら'<='が勝ち予測側）。 */
  thresholdDirection: '>=' | '<='
  /** そのthresholdだけで勝敗を予測した場合の的中率（0〜1）。 */
  thresholdAccuracy: number | null
}

interface ThresholdSearchResult {
  threshold: number | null
  accuracy: number | null
}

/**
 * 「value {>= or <=} threshold なら勝ちと予測する」という単純な1点しきい値ルールのうち、
 * 的中率が最大になるthresholdを全探索する（決定木の1分岐と同じ考え方）。
 * 同値が並ぶ区間の途中では区切らない（タイを分割しない）。
 */
function findBestThreshold(winValues: number[], lossValues: number[], higherIsBetter: boolean): ThresholdSearchResult {
  const combined = [
    ...winValues.map((v) => ({ v, isWin: true })),
    ...lossValues.map((v) => ({ v, isWin: false })),
  ].sort((a, b) => a.v - b.v)

  const n = combined.length
  if (n === 0) return { threshold: null, accuracy: null }

  const totalWin = winValues.length
  let prefixWin = 0
  let bestCorrect = -1
  let bestIndex = 0

  for (let i = 0; i <= n; i++) {
    const leftWin = prefixWin
    const leftLoss = i - leftWin
    const rightWin = totalWin - leftWin
    const rightLoss = n - i - rightWin

    // higherIsBetter: 右側(値が高い方)を勝ち予測、左側を負け予測。falseならその逆。
    const correct = higherIsBetter ? leftLoss + rightWin : leftWin + rightLoss

    const isValidSplit = i === 0 || i === n || combined[i - 1].v !== combined[i].v
    if (isValidSplit && correct > bestCorrect) {
      bestCorrect = correct
      bestIndex = i
    }

    if (i < n && combined[i].isWin) prefixWin += 1
  }

  let threshold: number
  if (bestIndex === 0) {
    threshold = combined[0].v
  } else if (bestIndex === n) {
    threshold = combined[n - 1].v
  } else {
    threshold = (combined[bestIndex - 1].v + combined[bestIndex].v) / 2
  }

  return { threshold, accuracy: bestCorrect / n }
}

/**
 * 試合×チームの行に、他ファイル（キックイベント）や同一試合の相手チーム行から導出した
 * 指標を合体させたもの。勝敗差分析はこちらを入力に取る。
 */
export interface ExtendedMatchRow extends MatchTeamRow {
  /** 相手チームの同一試合penaltiesConceded＝このチームが獲得したペナルティ数。 */
  penaltiesWon: number
  /** キャリー1回あたりの平均獲得メートル（carryMetres/carries）。carries=0ならnull。 */
  metresPerCarry: number | null
  /** インプレーキック（ペナルティキック除く）に占めるエラー系結果の割合。キックが0本ならnull。 */
  kickErrorRate: number | null
  /**
   * コンテストキック（Box/Bomb）のうち、相手のクリーンキャッチ（Caught Full/Collected Bounce）にも
   * 自チームのミス（Own Player - Failed／Error系）にもならなかった割合。
   * 「自チームが直接キャッチできたか」だけを見る再獲得率は勝敗との相関がほぼ無かった（d≈0.01、
   * 実データで検証済み）ため採用せず、こちらの広い意味での有効利用率を採用している（d≈0.16）。
   * コンテストキックが0本ならnull。
   */
  contestKickEffectiveRate: number | null
  /** ボール保持率（自チームpossessionSeconds / (自チーム+相手チームのpossessionSeconds)）。 */
  possessionShare: number | null
  /** 敵陣22m侵入からトライに至った割合（entries22Tries/entries22）。侵入0回ならnull。 */
  entries22TryRate: number | null
}

const CONTEST_KICK_TYPES = new Set(['Box', 'Bomb'])
const CONTEST_KICK_INEFFECTIVE_OUTCOMES = new Set(['Caught Full', 'Collected Bounce', 'Own Player - Failed'])

function isContestKickEffective(outcome: string): boolean {
  return !outcome.startsWith('Error') && !CONTEST_KICK_INEFFECTIVE_OUTCOMES.has(outcome)
}

/**
 * MatchTeamRowにキックイベント由来・相手チーム由来の指標を合体させる。
 * 勝敗差分析でチーム集計CSVだけでは出せない指標（キックのミス率など）も扱えるようにするため。
 */
export function attachDerivedMetrics(rows: MatchTeamRow[], kicks: KickEvent[]): ExtendedMatchRow[] {
  const concededByMatch = new Map<string, Map<string, number>>()
  const possessionByMatch = new Map<string, Map<string, number>>()
  for (const row of rows) {
    if (!concededByMatch.has(row.matchId)) concededByMatch.set(row.matchId, new Map())
    concededByMatch.get(row.matchId)!.set(row.team, row.penaltiesConceded)
    if (!possessionByMatch.has(row.matchId)) possessionByMatch.set(row.matchId, new Map())
    possessionByMatch.get(row.matchId)!.set(row.team, row.possessionSeconds)
  }

  const kicksByMatchTeam = new Map<string, KickEvent[]>()
  for (const kick of kicks) {
    if (!KICK_IN_PLAY_PHASES.has(kick.phase)) continue
    const key = `${kick.matchId}__${kick.team}`
    if (!kicksByMatchTeam.has(key)) kicksByMatchTeam.set(key, [])
    kicksByMatchTeam.get(key)!.push(kick)
  }

  return rows.map((row) => {
    const penaltiesWon = concededByMatch.get(row.matchId)?.get(row.opponent) ?? 0
    const metresPerCarry = row.carries ? row.carryMetres / row.carries : null

    const teamKicks = kicksByMatchTeam.get(`${row.matchId}__${row.team}`) ?? []
    const errorKicks = teamKicks.filter((k) => k.outcome.startsWith('Error')).length
    const kickErrorRate = teamKicks.length ? errorKicks / teamKicks.length : null

    const contestKicks = teamKicks.filter((k) => CONTEST_KICK_TYPES.has(k.kickType))
    const effectiveContestKicks = contestKicks.filter((k) => isContestKickEffective(k.outcome)).length
    const contestKickEffectiveRate = contestKicks.length ? effectiveContestKicks / contestKicks.length : null

    const opponentPossessionSeconds = possessionByMatch.get(row.matchId)?.get(row.opponent) ?? 0
    const totalPossessionSeconds = row.possessionSeconds + opponentPossessionSeconds
    const possessionShare = totalPossessionSeconds ? row.possessionSeconds / totalPossessionSeconds : null

    const entries22TryRate = row.entries22 ? row.entries22Tries / row.entries22 : null

    return {
      ...row,
      penaltiesWon,
      metresPerCarry,
      kickErrorRate,
      contestKickEffectiveRate,
      possessionShare,
      entries22TryRate,
    }
  })
}

interface WinLossMetricDef {
  key: string
  higherIsBetter: boolean
  getValue: (row: ExtendedMatchRow) => number | null
  format: (value: number) => string
}

// labelは持たない。key（=i18nの`metric_${key}`）を使って表示側（WinLossChart/WinLossTable）で翻訳する。
const WIN_LOSS_METRICS: WinLossMetricDef[] = [
  { key: 'tries', higherIsBetter: true, getValue: (r) => r.tries, format: (v) => `${v.toFixed(1)}` },
  {
    key: 'tackleSuccessRate',
    higherIsBetter: true,
    getValue: (r) => r.tackleSuccessRate,
    format: formatPercent,
  },
  { key: 'carryMetres', higherIsBetter: true, getValue: (r) => r.carryMetres, format: formatMetres },
  {
    key: 'scrumSuccessRate',
    higherIsBetter: true,
    getValue: (r) => r.scrumSuccessRate,
    format: formatPercent,
  },
  {
    key: 'lineoutSuccessRate',
    higherIsBetter: true,
    getValue: (r) => r.lineoutSuccessRate,
    format: formatPercent,
  },
  {
    key: 'turnoversWon',
    higherIsBetter: true,
    getValue: (r) => r.turnoversWon,
    format: (v) => `${v.toFixed(1)}`,
  },
  {
    key: 'turnoversConceded',
    higherIsBetter: false,
    getValue: (r) => r.turnoversConceded,
    format: (v) => `${v.toFixed(1)}`,
  },
  {
    key: 'penaltiesConceded',
    higherIsBetter: false,
    getValue: (r) => r.penaltiesConceded,
    format: (v) => `${v.toFixed(1)}`,
  },
  {
    key: 'cards',
    higherIsBetter: false,
    getValue: (r) => r.yellowCards + r.redCards,
    format: (v) => `${v.toFixed(2)}`,
  },
  {
    key: 'penaltiesWon',
    higherIsBetter: true,
    getValue: (r) => r.penaltiesWon,
    format: (v) => `${v.toFixed(1)}`,
  },
  {
    key: 'metresPerCarry',
    higherIsBetter: true,
    getValue: (r) => r.metresPerCarry,
    format: (v) => `${v.toFixed(1)}m`,
  },
  {
    key: 'kickErrorRate',
    higherIsBetter: false,
    getValue: (r) => r.kickErrorRate,
    format: formatPercent,
  },
  {
    key: 'contestKickEffectiveRate',
    higherIsBetter: true,
    getValue: (r) => r.contestKickEffectiveRate,
    format: formatPercent,
  },
  {
    key: 'possessionShare',
    higherIsBetter: true,
    getValue: (r) => r.possessionShare,
    format: formatPercent,
  },
  {
    key: 'lineBreaks',
    higherIsBetter: true,
    getValue: (r) => r.lineBreaks,
    format: (v) => `${v.toFixed(1)}`,
  },
  {
    key: 'entries22',
    higherIsBetter: true,
    getValue: (r) => r.entries22,
    format: (v) => `${v.toFixed(1)}`,
  },
  {
    key: 'entries22TryRate',
    higherIsBetter: true,
    getValue: (r) => r.entries22TryRate,
    format: formatPercent,
  },
]

function meanAndVariance(values: number[]) {
  const n = values.length
  if (n === 0) return { mean: 0, variance: 0, n: 0 }
  const mean = values.reduce((a, b) => a + b, 0) / n
  const variance = n > 1 ? values.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1) : 0
  return { mean, variance, n }
}

/**
 * 勝ち試合と負け試合で各指標の平均がどれだけ違うかを比較する。
 * 単位が指標ごとに異なる（本/m/%）ため、標準偏差で正規化した効果量（Cohen's d）の絶対値が
 * 大きい順に並べる＝「勝敗を最も分ける指標」が上に来る。引き分けは対象外。
 */
export function winLossComparison(rows: ExtendedMatchRow[]): WinLossRow[] {
  const winRows = rows.filter((r) => r.result === 'W')
  const lossRows = rows.filter((r) => r.result === 'L')

  return WIN_LOSS_METRICS.map((metric) => {
    const winValues = winRows.map(metric.getValue).filter((v): v is number => v !== null)
    const lossValues = lossRows.map(metric.getValue).filter((v): v is number => v !== null)
    const w = meanAndVariance(winValues)
    const l = meanAndVariance(lossValues)
    // 勝ち・負けどちらかが0件だと比較が成立しない（例: 特定の対戦相手に全勝/全敗）。
    // その場合advantage/cohensD/thresholdはnullにする（0や見かけ上の値を出すと誤解を招くため）。
    const hasBothSides = w.n > 0 && l.n > 0

    let advantage: number | null = null
    let cohensD: number | null = null
    if (hasBothSides) {
      const rawDiff = w.mean - l.mean
      advantage = metric.higherIsBetter ? rawDiff : -rawDiff

      const pooledDf = w.n + l.n - 2
      const pooledVariance = pooledDf > 0 ? ((w.n - 1) * w.variance + (l.n - 1) * l.variance) / pooledDf : 0
      const pooledSd = Math.sqrt(pooledVariance)
      cohensD = pooledSd > 0 ? advantage / pooledSd : 0
    }

    const { threshold, accuracy } = hasBothSides
      ? findBestThreshold(winValues, lossValues, metric.higherIsBetter)
      : { threshold: null, accuracy: null }

    return {
      key: metric.key,
      format: metric.format,
      winAvg: w.n > 0 ? w.mean : null,
      lossAvg: l.n > 0 ? l.mean : null,
      advantage,
      cohensD,
      nWin: w.n,
      nLoss: l.n,
      threshold,
      thresholdDirection: metric.higherIsBetter ? ('>=' as const) : ('<=' as const),
      thresholdAccuracy: accuracy,
    }
  }).sort((a, b) => Math.abs(b.cohensD ?? 0) - Math.abs(a.cohensD ?? 0))
}

/** 選手別ランキング（期間合計）の1行分。 */
export interface PlayerLeaderboardRow {
  player: string
  team: string
  matches: number
  minutesPlayed: number
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

/** 選手×試合の行を選手（かつチーム）単位に合計し、ランキング表示用の1行/選手に集約する。 */
export function playerLeaderboard(rows: PlayerMatchRow[]): PlayerLeaderboardRow[] {
  const totals = new Map<string, PlayerLeaderboardRow>()
  const order: string[] = []
  for (const row of rows) {
    const key = `${row.player}__${row.team}`
    if (!totals.has(key)) {
      totals.set(key, {
        player: row.player,
        team: row.team,
        matches: 0,
        minutesPlayed: 0,
        tries: 0,
        tacklesAttempted: 0,
        tacklesMade: 0,
        tackleSuccessRate: null,
        turnoversForced: 0,
        carries: 0,
        carryMetres: 0,
        penaltiesConceded: 0,
        yellowCards: 0,
        redCards: 0,
      })
      order.push(key)
    }
    const entry = totals.get(key)!
    entry.matches += 1
    entry.minutesPlayed += row.minutesPlayed ?? 0
    entry.tries += row.tries
    entry.tacklesAttempted += row.tacklesAttempted
    entry.tacklesMade += row.tacklesMade
    entry.turnoversForced += row.turnoversForced
    entry.carries += row.carries
    entry.carryMetres += row.carryMetres
    entry.penaltiesConceded += row.penaltiesConceded
    entry.yellowCards += row.yellowCards
    entry.redCards += row.redCards
  }
  return order
    .map((key) => {
      const entry = totals.get(key)!
      entry.tackleSuccessRate = entry.tacklesAttempted ? entry.tacklesMade / entry.tacklesAttempted : null
      return entry
    })
    .sort((a, b) => b.tries - a.tries)
}

/** 列に含まれるユニーク値を初出順で返す（スライサーの選択肢生成用）。 */
export function uniqueValues<T>(rows: T[], keyFn: (row: T) => string) {
  const seen = new Set<string>()
  const result: string[] = []
  for (const row of rows) {
    const value = keyFn(row)
    if (!seen.has(value)) {
      seen.add(value)
      result.push(value)
    }
  }
  return result
}

/** チーム別ディフェンス集計表（タックル・ジャッカル・ペナルティ）の1行分。 */
export interface DefenseRow {
  team: string
  matches: number
  tackleAttemptAve: number
  tacklesMade: number
  tacklesAttempted: number
  tackleSuccessRate: number | null
  /** タックル成功率の順位（1位が最良）。同率は同順位。成功率がない場合はnull。 */
  tackleRank: number | null
  tacklesDominant: number
  tackleDominantAve: number
  offloadAllowedTackles: number
  offloadAllowedAve: number
  jackalAttempts: number
  jackalWon: number
  jackalWonAve: number
  jackalSuccessRate: number | null
  turnoversWonTackle: number
  penaltiesConceded: number
  penaltiesConcededDefence: number
}

/**
 * チーム別のディフェンス集計表を作る。1試合あたり平均（Ave）が意味を持つ列は平均、
 * 成功率は加重成功率（分子・分母をチーム合計してから割る）、それ以外はシーズン合計で出す。
 * タックル成功率の順位は同率同順位（1,2,2,4...）。
 */
export function defenseLeaderboard(rows: MatchTeamRow[]): DefenseRow[] {
  interface Totals {
    matches: number
    tacklesAttempted: number
    tacklesMade: number
    tacklesDominant: number
    offloadAllowedTackles: number
    jackalAttempts: number
    jackalWon: number
    turnoversWonTackle: number
    penaltiesConceded: number
    penaltiesConcededDefence: number
  }
  const totalsByTeam = new Map<string, Totals>()
  const order: string[] = []
  for (const row of rows) {
    if (!totalsByTeam.has(row.team)) {
      totalsByTeam.set(row.team, {
        matches: 0,
        tacklesAttempted: 0,
        tacklesMade: 0,
        tacklesDominant: 0,
        offloadAllowedTackles: 0,
        jackalAttempts: 0,
        jackalWon: 0,
        turnoversWonTackle: 0,
        penaltiesConceded: 0,
        penaltiesConcededDefence: 0,
      })
      order.push(row.team)
    }
    const t = totalsByTeam.get(row.team)!
    t.matches += 1
    t.tacklesAttempted += row.tacklesAttempted
    t.tacklesMade += row.tacklesMade
    t.tacklesDominant += row.tacklesDominant
    t.offloadAllowedTackles += row.offloadAllowedTackles
    t.jackalAttempts += row.jackalAttempts
    t.jackalWon += row.jackalWon
    t.turnoversWonTackle += row.turnoversWonTackle
    t.penaltiesConceded += row.penaltiesConceded
    t.penaltiesConcededDefence += row.penaltiesConcededDefence
  }

  const result: DefenseRow[] = order.map((team) => {
    const t = totalsByTeam.get(team)!
    return {
      team,
      matches: t.matches,
      tacklesAttempted: t.tacklesAttempted,
      tacklesMade: t.tacklesMade,
      tackleAttemptAve: t.matches ? t.tacklesAttempted / t.matches : 0,
      tackleSuccessRate: t.tacklesAttempted ? t.tacklesMade / t.tacklesAttempted : null,
      tackleRank: null,
      tacklesDominant: t.tacklesDominant,
      tackleDominantAve: t.matches ? t.tacklesDominant / t.matches : 0,
      offloadAllowedTackles: t.offloadAllowedTackles,
      offloadAllowedAve: t.matches ? t.offloadAllowedTackles / t.matches : 0,
      jackalAttempts: t.jackalAttempts,
      jackalWon: t.jackalWon,
      jackalWonAve: t.matches ? t.jackalWon / t.matches : 0,
      jackalSuccessRate: t.jackalAttempts ? t.jackalWon / t.jackalAttempts : null,
      turnoversWonTackle: t.turnoversWonTackle,
      penaltiesConceded: t.penaltiesConceded,
      penaltiesConcededDefence: t.penaltiesConcededDefence,
    }
  })

  // タックル成功率の高い順に同率同順位（1,2,2,4...）で順位付けする。
  const byRate = [...result].sort((a, b) => (b.tackleSuccessRate ?? -Infinity) - (a.tackleSuccessRate ?? -Infinity))
  let rank = 0
  let prevRate: number | null = null
  byRate.forEach((row, i) => {
    if (row.tackleSuccessRate === null) return
    if (prevRate === null || row.tackleSuccessRate !== prevRate) {
      rank = i + 1
      prevRate = row.tackleSuccessRate
    }
    row.tackleRank = rank
  })

  return result.sort((a, b) => a.team.localeCompare(b.team))
}

/** defenseLeaderboard() の各集計列を合計・加重平均した「合計」行（テーブルの最終行用）。 */
export function defenseLeaderboardTotal(rows: DefenseRow[]): Omit<DefenseRow, 'team' | 'tackleRank'> {
  const sum = (f: (r: DefenseRow) => number) => rows.reduce((acc, r) => acc + f(r), 0)
  const matches = sum((r) => r.matches)
  const tacklesAttempted = sum((r) => r.tacklesAttempted)
  const tacklesMade = sum((r) => r.tacklesMade)
  const tacklesDominant = sum((r) => r.tacklesDominant)
  const offloadAllowedTackles = sum((r) => r.offloadAllowedTackles)
  const jackalAttempts = sum((r) => r.jackalAttempts)
  const jackalWon = sum((r) => r.jackalWon)
  return {
    matches,
    tacklesAttempted,
    tacklesMade,
    tackleAttemptAve: matches ? tacklesAttempted / matches : 0,
    tackleSuccessRate: tacklesAttempted ? tacklesMade / tacklesAttempted : null,
    tacklesDominant,
    tackleDominantAve: matches ? tacklesDominant / matches : 0,
    offloadAllowedTackles,
    offloadAllowedAve: matches ? offloadAllowedTackles / matches : 0,
    jackalAttempts,
    jackalWon,
    jackalWonAve: matches ? jackalWon / matches : 0,
    jackalSuccessRate: jackalAttempts ? jackalWon / jackalAttempts : null,
    turnoversWonTackle: sum((r) => r.turnoversWonTackle),
    penaltiesConceded: sum((r) => r.penaltiesConceded),
    penaltiesConcededDefence: sum((r) => r.penaltiesConcededDefence),
  }
}
