import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { FilterState } from '../types/sales'

interface FilterContextValue {
  filters: FilterState
  toggleRegion: (region: string) => void
  toggleCategory: (category: string) => void
  reset: () => void
}

const EMPTY_FILTERS: FilterState = { regions: [], categories: [] }

const FilterContext = createContext<FilterContextValue | null>(null)

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

/** スライサー（地域・カテゴリ）の選択状態をダッシュボード全体で共有するためのProvider。 */
export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      toggleRegion: (region) =>
        setFilters((prev) => ({ ...prev, regions: toggleValue(prev.regions, region) })),
      toggleCategory: (category) =>
        setFilters((prev) => ({ ...prev, categories: toggleValue(prev.categories, category) })),
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
