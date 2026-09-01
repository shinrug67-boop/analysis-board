import { useMemo, useState } from 'react'
import type { MatchTeamRow, KickEvent } from '../types/match'
import { winLossComparison, attachDerivedMetrics, uniqueValues } from '../utils/aggregate'
import { useLanguage } from '../i18n/LanguageContext'
import { WinLossChart } from './charts/WinLossChart'
import { WinLossTable } from './WinLossTable'

/**
 * 勝敗差分析一式（シーズン/チームのローカル絞り込み＋効果量チャート＋詳細テーブル）。
 * グローバルのチーム/シーズンSlicerとは独立して、この中で完結した状態を持つ
 * （キッキングチャートと同じ考え方。「すべて」を選べば全データで見られる）。
 */
export function WinLossSection({ rows, kicks }: { rows: MatchTeamRow[]; kicks: KickEvent[] }) {
  const { t } = useLanguage()
  const extendedRows = useMemo(() => attachDerivedMetrics(rows, kicks), [rows, kicks])

  const allSeasons = useMemo(() => [...uniqueValues(rows, (r) => r.season)].sort(), [rows])
  const [season, setSeason] = useState('')

  const teamsForSeason = useMemo(() => {
    const scoped = season ? rows.filter((r) => r.season === season) : rows
    return [...uniqueValues(scoped, (r) => r.team)].sort()
  }, [rows, season])
  const [team, setTeam] = useState('')

  const filteredRows = useMemo(
    () =>
      extendedRows.filter((r) => (season === '' || r.season === season) && (team === '' || r.team === team)),
    [extendedRows, season, team],
  )
  const winLossRows = useMemo(() => winLossComparison(filteredRows), [filteredRows])

  return (
    <>
      <div className="slicer" role="group" aria-label={t('sectionWinLoss')}>
        <div className="slicer__group">
          <span className="slicer__label">{t('season')}</span>
          <select
            className="select"
            value={season}
            onChange={(e) => {
              setSeason(e.target.value)
              setTeam('')
            }}
          >
            <option value="">{t('all')}</option>
            {allSeasons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="slicer__group">
          <span className="slicer__label">{t('team')}</span>
          <select className="select" value={team} onChange={(e) => setTeam(e.target.value)}>
            <option value="">{t('all')}</option>
            {teamsForSeason.map((teamOption) => (
              <option key={teamOption} value={teamOption}>
                {teamOption}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="card">
        <h2>{t('winLossChartTitle')}</h2>
        <WinLossChart data={winLossRows} />
      </div>
      <div className="card">
        <h2>{t('winLossTableTitle')}</h2>
        <WinLossTable rows={winLossRows} />
      </div>
    </>
  )
}
