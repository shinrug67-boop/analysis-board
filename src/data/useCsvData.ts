import { useEffect, useState } from 'react'
import Papa from 'papaparse'

interface CsvDataState<T> {
  rows: T[]
  loading: boolean
  error: string | null
}

/**
 * public/data/ 配下のCSVをfetchしてパースし、mapRowで型付き行に変換して返す共通フック。
 * useMatchData・usePlayerMatchData・useKickEvents はすべてこの上に薄く実装されている。
 */
export function useCsvData<T>(
  fileName: string,
  mapRow: (raw: Record<string, string>) => T,
): CsvDataState<T> {
  const [state, setState] = useState<CsvDataState<T>>({ rows: [], loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    const csvUrl = `${import.meta.env.BASE_URL}data/${fileName}`

    fetch(csvUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`データの取得に失敗しました (HTTP ${res.status})`)
        return res.text()
      })
      .then((text) => {
        const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
        if (parsed.errors.length > 0) {
          throw new Error(parsed.errors[0]?.message ?? 'CSVの解析に失敗しました')
        }
        const rows = parsed.data.map(mapRow)
        if (!cancelled) setState({ rows, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'データの読み込み中にエラーが発生しました'
          setState({ rows: [], loading: false, error: message })
        }
      })

    return () => {
      cancelled = true
    }
    // mapRowは依存に含めない: 呼び出し側で毎レンダー新しい関数参照を渡しても再fetchしないため。
  }, [fileName])

  return state
}

/** CSVの空文字を null に、それ以外は数値に変換する（成功率など「試行なし」を区別したい列用）。 */
export function toNumberOrNull(value: string): number | null {
  return value === '' ? null : Number(value)
}
