import { useTranslation } from 'react-i18next'

const langs = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हि' },
  { code: 'mr', label: 'म' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const change = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
  }

  return (
    <div className="flex items-center gap-1 rounded-lg p-1"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
      {langs.map(({ code, label }) => {
        const active = i18n.language.split('-')[0] === code
        return (
          <button
            key={code}
            onClick={() => change(code)}
            className="rounded-md px-2.5 py-1 text-xs font-semibold transition-all duration-200"
            style={active
              ? { background: 'rgba(6,148,162,0.3)', color: '#7edce2', border: '1px solid rgba(22,189,202,0.4)' }
              : { color: '#94a3b8', border: '1px solid transparent' }
            }
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
