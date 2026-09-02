/** 0〜1の比率を「86.4%」のような表示用文字列に整形する。 */
export function formatPercent(value: number | null): string {
  return value === null ? '—' : `${(value * 100).toFixed(1)}%`
}

/** メートル数を「1,305m」のような表示用文字列に整形する。 */
export function formatMetres(value: number): string {
  return `${Math.round(value).toLocaleString('ja-JP')}m`
}

/** 1試合あたり平均などを小数第1位までの表示用文字列に整形する（例:「180.8」）。 */
export function formatAve(value: number): string {
  return value.toFixed(1)
}

/**
 * 日付文字列 (YYYY-MM-DD) を「'24/12/9」表示に整形する（軸ラベル用）。
 * シーズン（12月〜翌年6月）をまたいで表示するため、月日だけだと年が曖昧になり紛らわしい。
 */
export function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `'${year.slice(2)}/${Number(month)}/${Number(day)}`
}
