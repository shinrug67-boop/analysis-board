import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import type { SalesRow } from '../types/sales'

interface SalesDataState {
  rows: SalesRow[]
  loading: boolean
  error: string | null
}

const CSV_ROW_KEYS = ['date', 'region', 'category', 'product', 'amount', 'quantity'] as const

/** public/data/sales.csv をfetchしてパースし、型付きの売上データとして返すフック。 */
export function useSalesData(): SalesDataState {
  const [state, setState] = useState<SalesDataState>({ rows: [], loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    const csvUrl = `${import.meta.env.BASE_URL}data/sales.csv`

    fetch(csvUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`データの取得に失敗しました (HTTP ${res.status})`)
        return res.text()
      })
      .then((text) => {
        const parsed = Papa.parse<Record<(typeof CSV_ROW_KEYS)[number], string>>(text, {
          header: true,
          skipEmptyLines: true,
        })
        if (parsed.errors.length > 0) {
          throw new Error(parsed.errors[0]?.message ?? 'CSVの解析に失敗しました')
        }
        const rows: SalesRow[] = parsed.data.map((r) => ({
          date: r.date,
          region: r.region,
          category: r.category,
          product: r.product,
          amount: Number(r.amount),
          quantity: Number(r.quantity),
        }))
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
  }, [])

  return state
}
