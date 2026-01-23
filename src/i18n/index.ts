import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './translations/en'
import pt from './translations/pt'

export const LANGUAGE_STORAGE_KEY = 'catalogus_language'

const isBrowser = typeof window !== 'undefined'
const storedLanguage = isBrowser
  ? window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  : null

i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
    en: { translation: en },
  },
  lng: storedLanguage ?? 'pt',
  fallbackLng: 'pt',
  supportedLngs: ['pt', 'en'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

if (isBrowser) {
  document.documentElement.lang = i18n.language
  i18n.on('languageChanged', (language) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.lang = language
  })
}

export default i18n
