import { useMemo } from 'react'
import { FilterProvider, useFilters } from './state/FilterContext'
import { useMatchData } from './data/useMatchData'
import { sumTriesByTeam, avgTackleSuccessByDate, resultBreakdown, uniqueValues } from './utils/aggregate'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { Slicer } from './components/Slicer'
import { BarChart } from './components/charts/BarChart'
import { LineChart } from './components/charts/LineChart'
import { PieChart } from './components/charts/PieChart'
import { DataTable } from './components/DataTable'
import type { MatchTeamRow } from './types/match'

function Dashboard({ rows }: { rows: MatchTeamRow[] }) {
  const { filters } = useFilters()

  const allTeams = useMemo(() => [...uniqueValues(rows, (r) => r.team)].sort(), [rows])
  const allSeasons = useMemo(() => [...uniqueValues(rows, (r) => r.season)].sort(), [rows])

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          (filters.teams.length === 0 || filters.teams.includes(row.team)) &&
          (filters.seasons.length === 0 || filters.seasons.includes(row.season)),
      ),
    [rows, filters],
  )

  const byTeam = useMemo(() => sumTriesByTeam(filteredRows), [filteredRows])
  const byDate = useMemo(() => avgTackleSuccessByDate(filteredRows), [filteredRows])
  const byResult = useMemo(() => resultBreakdown(filteredRows), [filteredRows])

  return (
    <DashboardLayout
      filters={<Slicer teams={allTeams} seasons={allSeasons} />}
      charts={
        <>
          <div className="card">
            <h2>チーム別 トライ数合計</h2>
            <BarChart data={byTeam} />
          </div>
          <div className="card">
            <h2>日別 タックル成功率推移</h2>
            <LineChart data={byDate} />
          </div>
          <div className="card">
            <h2>勝敗内訳</h2>
            <PieChart data={byResult} />
          </div>
        </>
      }
      table={
        <div className="card">
          <h2>試合成績明細</h2>
          <DataTable rows={filteredRows} />
        </div>
      }
    />
  )
}

function App() {
  const { rows, loading, error } = useMatchData()

  if (loading) {
    return <div className="status-screen">読み込み中…</div>
  }
  if (error) {
    return <div className="status-screen status-screen--error">データの読み込みに失敗しました: {error}</div>
  }

  return (
    <FilterProvider>
      <Dashboard rows={rows} />
    </FilterProvider>
  )
}

export default App
