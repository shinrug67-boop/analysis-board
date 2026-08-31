import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { FilterState } from '../types/match'

interface FilterContextValue {
  filters: FilterState
  toggleTeam: (team: string) => void
  toggleSeason: (season: string) => void
  reset: () => void
}

const EMPTY_FILTERS: FilterState = { teams: [], seasons: [] }

const FilterContext = createContext<FilterContextValue | null>(null)

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

/** スライサー（チーム・シーズン）の選択状態をダッシュボード全体で共有するためのProvider。 */
export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      toggleTeam: (team) =>
        setFilters((prev) => ({ ...prev, teams: toggleValue(prev.teams, team) })),
      toggleSeason: (season) =>
        setFilters((prev) => ({ ...prev, seasons: toggleValue(prev.seasons, season) })),
      reset: () => setFilters(EMPTY_FILTERS),
    }),
    [filters],
  )

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function useFilters() {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilters must be used within a FilterProvider')
  return ctx
}
