import { useMemo } from 'react'
import { FilterProvider, useFilters } from './state/FilterContext'
import { useMatchData } from './data/useMatchData'
import { usePlayerMatchData } from './data/usePlayerMatchData'
import { useKickEvents } from './data/useKickEvents'
import {
  sumTriesByTeam,
  avgCarryMetresByTeam,
  weightedRateByTeam,
  avgTackleSuccessByDate,
  resultBreakdown,
  playerLeaderboard,
  winLossComparison,
  uniqueValues,
} from './utils/aggregate'
import { formatPercent, formatMetres } from './utils/format'
import { getTeamColor } from './theme/teamColors'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { Slicer } from './components/Slicer'
import { BarChart } from './components/charts/BarChart'
import { LineChart } from './components/charts/LineChart'
import { PieChart } from './components/charts/PieChart'
import { WinLossChart } from './components/charts/WinLossChart'
import { DataTable } from './components/DataTable'
import { PlayerTable } from './components/PlayerTable'
import { WinLossTable } from './components/WinLossTable'
import { KickAnalysisSection } from './components/KickAnalysisSection'
import type { MatchTeamRow, PlayerMatchRow, KickEvent } from './types/match'

interface DashboardProps {
  rows: MatchTeamRow[]
  playerRows: PlayerMatchRow[]
  kicks: KickEvent[]
}

function Dashboard({ rows, playerRows, kicks }: DashboardProps) {
  const { filters } = useFilters()

  const allTeams = useMemo(() => [...uniqueValues(rows, (r) => r.team)].sort(), [rows])
  const allSeasons = useMemo(() => [...uniqueValues(rows, (r) => r.season)].sort(), [rows])

  const matchesFilter = useMemo(
    () => (team: string, season: string) =>
      (filters.teams.length === 0 || filters.teams.includes(team)) &&
      (filters.seasons.length === 0 || filters.seasons.includes(season)),
    [filters],
  )

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesFilter(row.team, row.season)),
    [rows, matchesFilter],
  )
  const filteredPlayerRows = useMemo(
    () => playerRows.filter((row) => matchesFilter(row.team, row.season)),
    [playerRows, matchesFilter],
  )

  const byTeam = useMemo(() => sumTriesByTeam(filteredRows), [filteredRows])
  const byDate = useMemo(() => avgTackleSuccessByDate(filteredRows), [filteredRows])
  const byResult = useMemo(() => resultBreakdown(filteredRows), [filteredRows])
  const carryByTeam = useMemo(() => avgCarryMetresByTeam(filteredRows), [filteredRows])
  const scrumByTeam = useMemo(
    () => weightedRateByTeam(filteredRows, (r) => r.scrumWon, (r) => r.scrumAttempts),
    [filteredRows],
  )
  const lineoutByTeam = useMemo(
    () => weightedRateByTeam(filteredRows, (r) => r.lineoutWon, (r) => r.lineoutThrows),
    [filteredRows],
  )
  const leaderboard = useMemo(() => playerLeaderboard(filteredPlayerRows), [filteredPlayerRows])
  const winLossRows = useMemo(() => winLossComparison(filteredRows), [filteredRows])

  return (
    <DashboardLayout>
      <section className="dashboard__filters">
        <Slicer teams={allTeams} seasons={allSeasons} />
      </section>

      <section className="dashboard__charts">
        <div className="card">
          <h2>チーム別 トライ数合計</h2>
          <BarChart data={byTeam} unit="本" colorForKey={getTeamColor} />
        </div>
        <div className="card">
          <h2>日別 タックル成功率推移</h2>
          <LineChart data={byDate} />
        </div>
        <div className="card">
          <h2>勝敗内訳</h2>
          <PieChart data={byResult} />
        </div>
        <div className="card">
          <h2>チーム別 平均キャリー獲得m（1試合あたり）</h2>
          <BarChart data={carryByTeam} valueFormatter={formatMetres} colorForKey={getTeamColor} />
        </div>
        <div className="card">
          <h2>チーム別 スクラム成功率</h2>
          <BarChart data={scrumByTeam} valueFormatter={formatPercent} colorForKey={getTeamColor} />
        </div>
        <div className="card">
          <h2>チーム別 ラインアウト成功率</h2>
          <BarChart data={lineoutByTeam} valueFormatter={formatPercent} colorForKey={getTeamColor} />
        </div>
      </section>

      <section className="dashboard__table">
        <div className="card">
          <h2>試合成績明細</h2>
          <DataTable rows={filteredRows} />
        </div>
      </section>

      <section className="dashboard__section">
        <h2 className="dashboard__section-title">選手成績ランキング（期間合計）</h2>
        <div className="card">
          <PlayerTable rows={leaderboard} />
        </div>
      </section>

      <section className="dashboard__section">
        <h2 className="dashboard__section-title">キッキングチャート</h2>
        <KickAnalysisSection kicks={kicks} />
      </section>

      <section className="dashboard__section">
        <h2 className="dashboard__section-title">勝敗差分析（勝ち試合 vs 負け試合）</h2>
        <div className="card">
          <h2>効果量（Cohen&apos;s d）順 — 勝敗を最も分けている指標</h2>
          <WinLossChart data={winLossRows} />
        </div>
        <div className="card">
          <h2>指標別 詳細</h2>
          <WinLossTable rows={winLossRows} />
        </div>
      </section>
    </DashboardLayout>
  )
}

function App() {
  const match = useMatchData()
  const player = usePlayerMatchData()
  const kick = useKickEvents()

  const loading = match.loading || player.loading || kick.loading
  const error = match.error ?? player.error ?? kick.error

  if (loading) {
    return <div className="status-screen">読み込み中…</div>
  }
  if (error) {
    return <div className="status-screen status-screen--error">データの読み込みに失敗しました: {error}</div>
  }

  return (
    <FilterProvider>
      <Dashboard rows={match.rows} playerRows={player.rows} kicks={kick.rows} />
    </FilterProvider>
  )
}

export default App
