/** キッキングチャートでのキック種別（ActionTypeName）ごとの色分け。ユーザー指定の配色。 */
export const KICK_TYPE_COLORS: Record<string, string> = {
  Territorial: '#a6790a', // 暗め黄色
  'Touch Kick': '#ffffff', // 白
  'Cross Pitch': '#b5591f', // 暗めオレンジ
  Box: '#a8527a', // 暗めピンク
  Bomb: '#2e8b57', // 緑
  Low: '#4fc3d9', // 水色
  Chip: '#7b4fa0', // 紫
}

const FALLBACK_COLOR = '#898781'

export function getKickTypeColor(kickType: string): string {
  return KICK_TYPE_COLORS[kickType] ?? FALLBACK_COLOR
}

/** 一覧表示（凡例・内訳テーブル）用に固定順で並べたキック種別一覧。 */
export const KICK_TYPE_ORDER = ['Touch Kick', 'Territorial', 'Box', 'Low', 'Chip', 'Bomb', 'Cross Pitch']
