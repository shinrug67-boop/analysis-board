/**
 * キッキングチャートでのキック種別（ActionTypeName）ごとの色分け。ユーザー指定の配色をベースに、
 * フィールドを濃い緑にした上でも視認できるよう明度を調整している
 * （特にBombは緑系のため濃い緑の背景に沈みやすく、Territorialも同様に明るめへ調整）。
 */
export const KICK_TYPE_COLORS: Record<string, string> = {
  Territorial: '#e0a824', // 暗め黄色（濃い緑の背景でも視認できる明るさに調整）
  'Touch Kick': '#ffffff', // 白
  'Cross Pitch': '#d4692a', // 暗めオレンジ
  Box: '#c96b93', // 暗めピンク
  Bomb: '#7fd858', // 緑（背景の緑に沈まないよう明るいライムグリーンに調整）
  Low: '#5fd4ea', // 水色
  Chip: '#9a6cc2', // 紫
}

const FALLBACK_COLOR = '#898781'

export function getKickTypeColor(kickType: string): string {
  return KICK_TYPE_COLORS[kickType] ?? FALLBACK_COLOR
}

/** 一覧表示（凡例・内訳テーブル）用に固定順で並べたキック種別一覧。 */
export const KICK_TYPE_ORDER = ['Touch Kick', 'Territorial', 'Box', 'Low', 'Chip', 'Bomb', 'Cross Pitch']
