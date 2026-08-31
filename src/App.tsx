import { useMemo } from 'react'
import { FilterProvider, useFilters } from './state/FilterContext'
import { useSalesData } from './data/useSalesData'
import { sumByRegion, sumByCategory, sumByDate, uniqueValues } from './utils/aggregate'
import { palette } from './theme/palette'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { Slicer } from './components/Slicer'
import { BarChart } from './components/charts/BarChart'
import { LineChart } from './components/charts/LineChart'
import { PieChart } from './components/charts/PieChart'
import { DataTable } from './components/DataTable'
import type { SalesRow } from './types/sales'

/** 固定順のcategoricalパレットから、値の初出順に色を割り当てるマップを作る（フィルタで色が動かないよう全件から生成する）。 */
function buildColorMap(values: string[]): Record<string, string> {
  const map: Record<string, string> = {}
  values.forEach((value, i) => {
    map[value] = palette.categorical[i % palette.categorical.length]
  })
  return map
}

function Dashboard({ rows }: { rows: SalesRow[] }) {
  const { filters } = useFilters()

  const allRegions = useMemo(() => uniqueValues(rows, (r) => r.region), [rows])
  const allCategories = useMemo(() => uniqueValues(rows, (r) => r.category), [rows])
  const regionColorMap = useMemo(() => buildColorMap(allRegions), [allRegions])
  const categoryColorMap = useMemo(() => buildColorMap(allCategories), [allCategories])

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          (filters.regions.length === 0 || filters.regions.includes(row.region)) &&
          (filters.categories.length === 0 || filters.categories.includes(row.category)),
      ),
    [rows, filters],
  )

  const byRegion = useMemo(() => sumByRegion(filteredRows), [filteredRows])
  const byCategory = useMemo(() => sumByCategory(filteredRows), [filteredRows])
  const byDate = useMemo(() => sumByDate(filteredRows), [filteredRows])

  return (
    <DashboardLayout
      filters={<Slicer regions={allRegions} categories={allCategories} />}
      charts={
        <>
          <div className="card">
            <h2>地域別 売上合計</h2>
            <BarChart data={byRegion} colorMap={regionColorMap} />
          </div>
          <div className="card">
            <h2>日別 売上推移</h2>
            <LineChart data={byDate} />
          </div>
          <div className="card">
            <h2>カテゴリ別 売上構成比</h2>
            <PieChart data={byCategory} colorMap={categoryColorMap} />
          </div>
        </>
      }
      table={
        <div className="card">
          <h2>明細データ</h2>
          <DataTable rows={filteredRows} />
        </div>
      }
    />
  )
}

function App() {
  const { rows, loading, error } = useSalesData()

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
