import { useMemo, useState } from 'react'
import type { MatchTeamRow } from '../types/match'
import { winLossComparison, uniqueValues } from '../utils/aggregate'
import { WinLossChart } from './charts/WinLossChart'
import { WinLossTable } from './WinLossTable'

/**
 * 勝敗差分析一式（シーズン/チームのローカル絞り込み＋効果量チャート＋詳細テーブル）。
 * グローバルのチーム/シーズンSlicerとは独立して、この中で完結した状態を持つ
 * （キッキングチャートと同じ考え方。「すべて」を選べば全データで見られる）。
 */
export function WinLossSection({ rows }: { rows: MatchTeamRow[] }) {
  const allSeasons = useMemo(() => [...uniqueValues(rows, (r) => r.season)].sort(), [rows])
  const [season, setSeason] = useState('')

  const teamsForSeason = useMemo(() => {
    const scoped = season ? rows.filter((r) => r.season === season) : rows
    return [...uniqueValues(scoped, (r) => r.team)].sort()
  }, [rows, season])
  const [team, setTeam] = useState('')

  const filteredRows = useMemo(
    () => rows.filter((r) => (season === '' || r.season === season) && (team === '' || r.team === team)),
    [rows, season, team],
  )
  const winLossRows = useMemo(() => winLossComparison(filteredRows), [filteredRows])

  return (
    <>
      <div className="slicer" role="group" aria-label="勝敗差分析の絞り込み">
        <div className="slicer__group">
          <span className="slicer__label">シーズン</span>
          <select
            className="select"
            value={season}
            onChange={(e) => {
              setSeason(e.target.value)
              setTeam('')
            }}
          >
            <option value="">すべて</option>
            {allSeasons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="slicer__group">
          <span className="slicer__label">チーム</span>
          <select className="select" value={team} onChange={(e) => setTeam(e.target.value)}>
            <option value="">すべて</option>
            {teamsForSeason.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="card">
        <h2>効果量（Cohen&apos;s d）順 — 勝敗を最も分けている指標</h2>
        <WinLossChart data={winLossRows} />
      </div>
      <div className="card">
        <h2>指標別 詳細</h2>
        <WinLossTable rows={winLossRows} />
      </div>
    </>
  )
}
