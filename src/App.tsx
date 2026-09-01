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
  uniqueValues,
} from './utils/aggregate'
import { formatPercent, formatMetres } from './utils/format'
import { getTeamColor } from './theme/teamColors'
import { useLanguage } from './i18n/LanguageContext'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { Slicer } from './components/Slicer'
import { BarChart } from './components/charts/BarChart'
import { LineChart } from './components/charts/LineChart'
import { PieChart } from './components/charts/PieChart'
import { DataTable } from './components/DataTable'
import { PlayerTable } from './components/PlayerTable'
import { KickAnalysisSection } from './components/KickAnalysisSection'
import { WinLossSection } from './components/WinLossSection'
import type { MatchTeamRow, PlayerMatchRow, KickEvent } from './types/match'

interface DashboardProps {
  rows: MatchTeamRow[]
  playerRows: PlayerMatchRow[]
  kicks: KickEvent[]
}

function Dashboard({ rows, playerRows, kicks }: DashboardProps) {
  const { filters } = useFilters()
  const { t } = useLanguage()

  const allTeams = useMemo(() => [...uniqueValues(rows, (r) => r.team)].sort(), [rows])
  const allSeasons = useMemo(() => [...uniqueValues(rows, (r) => r.season)].sort(), [rows])
  const allOpponents = useMemo(() => [...uniqueValues(rows, (r) => r.opponent)].sort(), [rows])

  const matchesFilter = useMemo(
    () => (team: string, season: string, opponent: string) =>
      (filters.teams.length === 0 || filters.teams.includes(team)) &&
      (filters.seasons.length === 0 || filters.seasons.includes(season)) &&
      (filters.opponents.length === 0 || filters.opponents.includes(opponent)),
    [filters],
  )

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesFilter(row.team, row.season, row.opponent)),
    [rows, matchesFilter],
  )
  const filteredPlayerRows = useMemo(
    () => playerRows.filter((row) => matchesFilter(row.team, row.season, row.opponent)),
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

  return (
    <DashboardLayout>
      <section className="dashboard__filters">
        <Slicer teams={allTeams} seasons={allSeasons} opponents={allOpponents} />
      </section>

      <section className="dashboard__charts">
        <div className="card">
          <h2>{t('chartTriesByTeam')}</h2>
          <BarChart data={byTeam} unit={t('unitTries')} colorForKey={getTeamColor} />
        </div>
        <div className="card">
          <h2>{t('chartTackleTrend')}</h2>
          <LineChart data={byDate} />
        </div>
        <div className="card">
          <h2>{t('chartResultBreakdown')}</h2>
          <PieChart data={byResult} />
        </div>
        <div className="card">
          <h2>{t('chartCarryByTeam')}</h2>
          <BarChart data={carryByTeam} valueFormatter={formatMetres} colorForKey={getTeamColor} />
        </div>
        <div className="card">
          <h2>{t('chartScrumByTeam')}</h2>
          <BarChart data={scrumByTeam} valueFormatter={formatPercent} colorForKey={getTeamColor} />
        </div>
        <div className="card">
          <h2>{t('chartLineoutByTeam')}</h2>
          <BarChart data={lineoutByTeam} valueFormatter={formatPercent} colorForKey={getTeamColor} />
        </div>
      </section>

      <section className="dashboard__table">
        <div className="card">
          <h2>{t('sectionMatchDetails')}</h2>
          <DataTable rows={filteredRows} />
        </div>
      </section>

      <section className="dashboard__section">
        <h2 className="dashboard__section-title">{t('sectionPlayerRanking')}</h2>
        <div className="card">
          <PlayerTable rows={leaderboard} />
        </div>
      </section>

      <section className="dashboard__section">
        <h2 className="dashboard__section-title">{t('sectionKickingChart')}</h2>
        <KickAnalysisSection kicks={kicks} />
      </section>

      <section className="dashboard__section">
        <h2 className="dashboard__section-title">{t('sectionWinLoss')}</h2>
        <WinLossSection rows={rows} kicks={kicks} />
      </section>
    </DashboardLayout>
  )
}

function App() {
  const { t } = useLanguage()
  const match = useMatchData()
  const player = usePlayerMatchData()
  const kick = useKickEvents()

  const loading = match.loading || player.loading || kick.loading
  const error = match.error ?? player.error ?? kick.error

  if (loading) {
    return <div className="status-screen">{t('loading')}</div>
  }
  if (error) {
    return (
      <div className="status-screen status-screen--error">
        {t('loadError')}: {error}
      </div>
    )
  }

  return (
    <FilterProvider>
      <Dashboard rows={match.rows} playerRows={player.rows} kicks={kick.rows} />
    </FilterProvider>
  )
}

export default App
