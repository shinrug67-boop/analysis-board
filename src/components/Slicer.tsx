import { useFilters } from '../state/FilterContext'

interface SlicerProps {
  regions: string[]
  categories: string[]
}

/**
 * 地域・カテゴリを絞り込むスライサー。チャート・テーブルより上の1行に置き、
 * 選択状態はFilterContext経由でダッシュボード全体に反映される。
 */
export function Slicer({ regions, categories }: SlicerProps) {
  const { filters, toggleRegion, toggleCategory, reset } = useFilters()
  const hasActiveFilter = filters.regions.length > 0 || filters.categories.length > 0

  return (
    <div className="slicer" role="group" aria-label="データの絞り込み">
      <div className="slicer__group">
        <span className="slicer__label">地域</span>
        <div className="slicer__chips">
          {regions.map((region) => (
            <button
              key={region}
              type="button"
              className={`chip ${filters.regions.includes(region) ? 'is-active' : ''}`}
              aria-pressed={filters.regions.includes(region)}
              onClick={() => toggleRegion(region)}
            >
              {region}
            </button>
          ))}
        </div>
      </div>
      <div className="slicer__group">
        <span className="slicer__label">カテゴリ</span>
        <div className="slicer__chips">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`chip ${filters.categories.includes(category) ? 'is-active' : ''}`}
              aria-pressed={filters.categories.includes(category)}
              onClick={() => toggleCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="slicer__reset" onClick={reset} disabled={!hasActiveFilter}>
        フィルタをリセット
      </button>
    </div>
  )
}
