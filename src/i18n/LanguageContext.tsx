import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { translations, type Lang, type TranslationKey } from './translations'

const STORAGE_KEY = 'analysis-board-lang'

/** 翻訳文字列を取得する関数の型。{name}形式のプレースホルダーはparamsで置換できる。 */
export type TFunction = (key: TranslationKey, params?: Record<string, string | number>) => string

interface LanguageContextValue {
  lang: Lang
  toggleLang: () => void
  t: TFunction
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function loadInitialLang(): Lang {
  if (typeof window === 'undefined') return 'ja'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'en' ? 'en' : 'ja'
  } catch {
    return 'ja'
  }
}

/** UI言語（ja/en）の状態管理とtranslate関数を提供するProvider。選択はlocalStorageに保存する。 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(loadInitialLang)

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      toggleLang: () => {
        setLang((prev) => {
          const next = prev === 'ja' ? 'en' : 'ja'
          try {
            window.localStorage.setItem(STORAGE_KEY, next)
          } catch {
            // localStorageが使えない環境でも動作は継続する
          }
          return next
        })
      },
      t: (key, params) => {
        let text: string = translations[lang][key]
        if (params) {
          for (const [name, value] of Object.entries(params)) {
            text = text.replace(`{${name}}`, String(value))
          }
        }
        return text
      },
    }),
    [lang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
