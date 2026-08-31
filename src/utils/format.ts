/** 金額を「¥12,345」のような表示用文字列に整形する。 */
export function formatYen(value: number): string {
  return `¥${Math.round(value).toLocaleString('ja-JP')}`
}

/** 日付文字列 (YYYY-MM-DD) を「M/D」表示に整形する（軸ラベル用）。 */
export function formatShortDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-')
  return `${Number(month)}/${Number(day)}`
}
