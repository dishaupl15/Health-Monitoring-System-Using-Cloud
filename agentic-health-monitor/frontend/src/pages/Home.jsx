import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageShell from '../components/PageShell.jsx'

const cardStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }

export default function Home() {
  const { t } = useTranslation()

  const features = [
    { icon: '🧬', title: t('home.feat1Title'), desc: t('home.feat1Desc') },
    { icon: '📋', title: t('home.feat2Title'), desc: t('home.feat2Desc') },
    { icon: '⚡', title: t('home.feat3Title'), desc: t('home.feat3Desc') },
    { icon: '📊', title: t('home.feat4Title'), desc: t('home.feat4Desc') },
  ]

  const steps = [
    { num: t('home.step1Num'), title: t('home.step1Title'), desc: t('home.step1Desc') },
    { num: t('home.step2Num'), title: t('home.step2Title'), desc: t('home.step2Desc') },
    { num: t('home.step3Num'), title: t('home.step3Title'), desc: t('home.step3Desc') },
  ]

  return (
    <PageShell title={t('home.title')} description={t('home.description')}>

      {/* Hero CTA */}
      <div className="relative overflow-hidden rounded-2xl p-8 mb-8"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ background: 'linear-gradient(90deg, rgba(6,148,162,0.12) 0%, transparent 60%)' }} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('home.heroCta')}</h2>
            <p className="text-slate-400 text-sm max-w-lg">{t('home.heroDesc')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/symptom-form" className="btn-primary whitespace-nowrap">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {t('home.startAssessment')}
            </Link>
            <Link to="/history" className="btn-secondary whitespace-nowrap">{t('home.viewHistory')}</Link>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-8">
        <h2 className="section-title mb-4">{t('home.howItWorks')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.num} className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 group"
              style={cardStyle}>
              <div className="absolute top-4 right-4 text-4xl font-black select-none"
                style={{ color: 'rgba(255,255,255,0.04)' }}>{step.num}</div>
              <div className="text-brand-400 text-2xl font-black mb-3">{step.num}</div>
              <h3 className="font-semibold text-white mb-1">{step.title}</h3>
              <p className="text-sm text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="section-title mb-4">{t('home.features')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="glass-card-hover p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-1 text-sm">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
