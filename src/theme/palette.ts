/**
 * dataviz スキルの検証済みデフォルトパレット（ライトモード）。
 * チャートの配色・チャート周りの地色/罫線/文字色はすべてここから取る。
 * 将来ダークモード対応を追加する際は、ここに dark 版を足して切り替える。
 */
export const palette = {
  surface: '#fcfcfb',
  pagePlane: '#f9f9f7',
  textPrimary: '#0b0b0b',
  textSecondary: '#52514e',
  muted: '#898781',
  gridline: '#e1e0d9',
  baseline: '#c3c2b7',
  border: 'rgba(11,11,11,0.10)',
  // 固定順の categorical パレット。系列が増えても既存の色は動かさない。
  categorical: [
    '#2a78d6', // blue
    '#eb6834', // orange
    '#1baf7a', // aqua
    '#eda100', // yellow
    '#e87ba4', // magenta
    '#008300', // green
    '#4a3aa7', // violet
    '#e34948', // red
  ],
  // status色（良い/悪い/中立）。categoricalとは別枠で、勝敗など状態を表す場面でのみ使う。
  status: {
    good: '#0ca30c',
    critical: '#d03b3b',
    neutral: '#898781',
  },
} as const

export const fontFamily = 'system-ui, -apple-system, "Segoe UI", sans-serif'
