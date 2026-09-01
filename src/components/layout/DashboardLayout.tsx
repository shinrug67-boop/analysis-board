import type { ReactNode } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'

/** ダッシュボード全体の骨格。ヘッダーの下に、渡された各セクションを縦に並べる。 */
export function DashboardLayout({ children }: { children: ReactNode }) {
  const { t, toggleLang } = useLanguage()

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-text">
          <h1>Analysis Board</h1>
          <p>{t('appSubtitle')}</p>
        </div>
        <button type="button" className="lang-toggle" onClick={toggleLang}>
          {t('langToggle')}
        </button>
      </header>
      {children}
    </div>
  )
}
