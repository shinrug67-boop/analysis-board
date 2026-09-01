import { useMemo, useState } from 'react'
import type { MatchTeamRow, KickEvent } from '../types/match'
import { winLossComparison, attachDerivedMetrics, uniqueValues } from '../utils/aggregate'
import { useLanguage } from '../i18n/LanguageContext'
import { WinLossChart } from './charts/WinLossChart'
import { WinLossTable } from './WinLossTable'

/**
 * 勝敗差分析一式（シーズン/チーム/対戦相手のローカル絞り込み＋効果量チャート＋詳細テーブル）。
 * グローバルのSlicerとは独立して、この中で完結した状態を持つ
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

  const opponentsForSelection = useMemo(() => {
    const scoped = rows.filter(
      (r) => (season === '' || r.season === season) && (team === '' || r.team === team),
    )
    return [...uniqueValues(scoped, (r) => r.opponent)].sort()
  }, [rows, season, team])
  const [opponent, setOpponent] = useState('')

  const filteredRows = useMemo(
    () =>
      extendedRows.filter(
        (r) =>
          (season === '' || r.season === season) &&
          (team === '' || r.team === team) &&
          (opponent === '' || r.opponent === opponent),
      ),
    [extendedRows, season, team, opponent],
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
              setOpponent('')
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
          <select
            className="select"
            value={team}
            onChange={(e) => {
              setTeam(e.target.value)
              setOpponent('')
            }}
          >
            <option value="">{t('all')}</option>
            {teamsForSeason.map((teamOption) => (
              <option key={teamOption} value={teamOption}>
                {teamOption}
              </option>
            ))}
          </select>
        </div>
        <div className="slicer__group">
          <span className="slicer__label">{t('colOpponent')}</span>
          <select className="select" value={opponent} onChange={(e) => setOpponent(e.target.value)}>
            <option value="">{t('all')}</option>
            {opponentsForSelection.map((opponentOption) => (
              <option key={opponentOption} value={opponentOption}>
                {opponentOption}
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
