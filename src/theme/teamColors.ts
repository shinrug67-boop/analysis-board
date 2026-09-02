/**
 * チーム比較チャート用の、各チームのロゴ・ジャージカラーに寄せた配色。
 * 公式のブランドガイドライン（正確なブランドHEX値）は非公開のため、各チームの公式サイト・
 * リーグワン公式サイト等で公表されている「チームカラー」の説明を基にした近似値。
 * 複数チームが同系色（赤・黒・紺など）を公式カラーとしているため、チャート上で見分けが
 * つくよう同系色内でも明度・彩度をずらしている（x軸のチーム名ラベルが本来の識別手段であり、
 * 色はそれを補強する役割）。
 */
export const TEAM_COLORS: Record<string, string> = {
  'BlackRams Tokyo': '#1a1a1a', // 黒
  'Hanazono Kintetsu Liners': '#7a2331', // エンジ
  'Kobelco Kobe Steelers': '#b8452f', // 高炉の赤（赤系だが他チームと区別できる橙寄りの赤）
  'Kubota Spears': '#e8792c', // オレンジ
  'Mie Honda Heat': '#cc0000', // Honda Red
  'Mitsubishi Sagamihara Dynaboars': '#3c9a5f', // さがみはらグリーン
  'Saitama Wild Knights': '#2a5ca8', // 青
  'Shizuoka BlueRevs': '#1a8fd1', // レヴズブルー
  'Tokyo Sungoliath': '#f0b400', // イエロー
  'Toshiba Brave Lupus Tokyo': '#9e1b32', // 赤（他の赤系チームと区別できるワイン寄りの赤）
  'Toyota Verblitz': '#1f5c3f', // 伝統のダークグリーン
  'Urayasu D-Rocks': '#131c33', // ネイビー
  'Yokohama Canon Eagles': '#e02020', // レッド
}

const FALLBACK_COLOR = '#898781'

/** チームカラーを返す。未登録のチーム名（表記ゆれ・新規チーム等）はグレーにフォールバックする。 */
export function getTeamColor(team: string): string {
  return TEAM_COLORS[team] ?? FALLBACK_COLOR
}

/**
 * 列幅の狭い表（ディフェンス集計表など）で使う略称。データ上の値（`teamName`）はそのまま
 * 英語で保持し、表示だけこの短縮名に差し替える。未登録のチーム名はフルネームのまま表示する。
 */
const TEAM_SHORT_NAMES: Record<string, string> = {
  'BlackRams Tokyo': 'BlackRams',
  'Hanazono Kintetsu Liners': 'Kintetsu',
  'Kobelco Kobe Steelers': 'Kobelco Kobe',
  'Kubota Spears': 'Kubota',
  'Mie Honda Heat': 'Honda',
  'Mitsubishi Sagamihara Dynaboars': 'Mitsubishi',
  'Saitama Wild Knights': 'Saitama',
  'Shizuoka BlueRevs': 'BlueRevs',
  'Tokyo Sungoliath': 'Sungoliath',
  'Toshiba Brave Lupus Tokyo': 'Toshiba',
  'Toyota Verblitz': 'Toyota',
  'Urayasu D-Rocks': 'D-Rocks',
  'Yokohama Canon Eagles': 'Canon',
}

/** チームの略称を返す。未登録のチーム名はそのまま返す。 */
export function getTeamShortName(team: string): string {
  return TEAM_SHORT_NAMES[team] ?? team
}
