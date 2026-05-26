import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageShell from '../components/PageShell.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { generateReportPDF } from '../services/generatePDF.js'
import { shareReport } from '../services/api.js'

const riskConfig = {
  Emergency: { color: '#f87171', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', dot: '#f87171' },
  High:      { color: '#fb923c', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', dot: '#fb923c' },
  Medium:    { color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', dot: '#fbbf24' },
  Low:       { color: '#34d399', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', dot: '#34d399' },
}

const cardStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }
const innerCard = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem' }

function normalizeScores(conditions) {
  if (!conditions?.length) return []
  const total = conditions.reduce((s, c) => s + (c.score || 0), 0)
  return conditions
    .map(c => ({ ...c, pct: total > 0 ? Math.round((c.score / total) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct)
}

function StatCard({ label, value, sub }) {
  return (
    <div className="p-5 text-center" style={cardStyle}>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs font-semibold text-brand-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function History() {
  const { t } = useTranslation()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('All')
  const [shareState, setShareState] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setError(t('common.notLoggedIn')); setLoading(false); return }
      supabase
        .from('assessments')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .then(({ data, error: err }) => {
          if (err) setError(err.message || t('history.loadError'))
          else setHistory(data || [])
        })
        .finally(() => setLoading(false))
    })
  }, [])

  const handleShare = async (report, conditions) => {
    const id = report.id
    const existing = shareState[id]
    if (existing?.url) {
      navigator.clipboard.writeText(existing.url).then(() => {
        setShareState(s => ({ ...s, [id]: { ...s[id], copied: true } }))
        setTimeout(() => setShareState(s => ({ ...s, [id]: { ...s[id], copied: false } })), 2500)
      })
      return
    }
    setShareState(s => ({ ...s, [id]: { loading: true } }))
    try {
      const { token } = await shareReport(
        { risk_level: report.risk_level, explanation: report.summary, possible_conditions: conditions, follow_up_answers: report.follow_up_questions || {} },
        { symptoms: report.symptoms }
      )
      const url = `${window.location.origin}/shared/${token}`
      navigator.clipboard.writeText(url)
      setShareState(s => ({ ...s, [id]: { url, loading: false, copied: true } }))
      setTimeout(() => setShareState(s => ({ ...s, [id]: { ...s[id], copied: false } })), 2500)
    } catch {
      setShareState(s => ({ ...s, [id]: { loading: false, error: true } }))
      setTimeout(() => setShareState(s => ({ ...s, [id]: {} })), 3000)
    }
  }

  const riskLevelKeys = [
    { key: 'All',       label: t('history.filterAll') },
    { key: 'Emergency', label: t('history.riskEmergency') },
    { key: 'High',      label: t('history.riskHigh') },
    { key: 'Medium',    label: t('history.riskMedium') },
    { key: 'Low',       label: t('history.riskLow') },
  ]
  const filtered = filter === 'All' ? history : history.filter((r) => r.risk_level === filter)
  const stats = {
    total: history.length,
    high: history.filter((r) => ['Emergency', 'High'].includes(r.risk_level)).length,
    latest: history[0] ? new Date(history[0].created_at).toLocaleDateString() : '—',
  }

  return (
    <PageShell title={t('history.title')} description={t('history.description')}>
      <div className="space-y-6">

        {!loading && !error && history.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <StatCard label={t('history.totalReports')} value={stats.total} />
            <StatCard label={t('history.highRisk')} value={stats.high} sub={t('history.highRiskSub')} />
            <StatCard label={t('history.latest')} value={stats.latest} />
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {riskLevelKeys.map(({ key, label }) => {
              const cfg = riskConfig[key]
              const count = key === 'All' ? history.length : history.filter((r) => r.risk_level === key).length
              const isActive = filter === key
              const activeStyle = key === 'All'
                ? { background: 'rgba(6,148,162,0.2)', border: '1px solid rgba(22,189,202,0.4)', color: '#7edce2' }
                : cfg ? { background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color } : {}
              const inactiveStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }
              return (
                <button key={key} onClick={() => setFilter(key)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200"
                  style={isActive ? activeStyle : inactiveStyle}>
                  {label} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
                </button>
              )
            })}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center" style={cardStyle}>
            <svg className="h-8 w-8 animate-spin text-brand-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-slate-400 text-sm">{t('history.loadingReports')}</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center" style={cardStyle}>
            <div className="text-5xl mb-4">📋</div>
            <p className="text-white font-semibold mb-2">
              {history.length === 0 ? t('history.noReports') : t('history.noFilterReports', { level: filter })}
            </p>
            <p className="text-sm text-slate-400 mb-6">
              {history.length === 0 ? t('history.noReportsDesc') : t('history.tryFilter')}
            </p>
            {history.length === 0 && (
              <button onClick={() => navigate('/symptom-form')} className="btn-primary">{t('history.startAssessment')}</button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((report) => {
              const cfg = riskConfig[report.risk_level] || riskConfig.Low
              const isOpen = expanded === report.id
              const conditions = Array.isArray(report.possible_conditions) ? report.possible_conditions : []
              const ss = shareState[report.id] || {}

              return (
                <article key={report.id} className="overflow-hidden transition-all duration-300"
                  style={{ ...cardStyle, borderColor: isOpen ? 'rgba(22,189,202,0.25)' : 'rgba(255,255,255,0.1)' }}>
                  <button className="w-full text-left p-5" onClick={() => setExpanded(isOpen ? null : report.id)}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
                        <div>
                          <p className="text-sm font-bold text-white">{t('history.assessment')}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{new Date(report.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                          style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                          {t(`history.risk${report.risk_level}`) || report.risk_level}
                        </span>
                        <svg className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {!isOpen && <p className="mt-2 text-xs text-slate-500 truncate pl-5">{report.symptoms}</p>}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-4 space-y-4 animate-fade-in"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="label-text mb-1">{t('history.symptoms')}</p>
                          <p className="text-sm text-slate-300">{report.symptoms}</p>
                        </div>
                        <div>
                          <p className="label-text mb-1">{t('history.summary')}</p>
                          <p className="text-sm text-slate-300">{report.summary}</p>
                        </div>
                        {conditions.length > 0 && (
                          <div className="sm:col-span-2">
                            <p className="label-text mb-2">{t('history.differentialDiagnosis')}</p>
                            <div className="space-y-2">
                              {normalizeScores(conditions).map((c, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <span className="text-sm shrink-0">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-semibold text-white truncate">{c.name}</span>
                                      <span className="text-xs font-black ml-2 shrink-0"
                                        style={{ color: c.pct >= 60 ? '#f87171' : c.pct >= 35 ? '#fbbf24' : '#34d399' }}>
                                        {c.pct}%
                                      </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                                      <div className="h-full rounded-full"
                                        style={{ width: `${c.pct}%`, background: c.pct >= 60 ? '#f87171' : c.pct >= 35 ? '#fbbf24' : '#34d399' }} />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {report.follow_up_questions && Object.keys(report.follow_up_questions).length > 0 && (
                          <div className="sm:col-span-2">
                            <p className="label-text mb-2">{t('history.followUpAnswers')}</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {Object.entries(report.follow_up_questions).map(([q, a]) => (
                                <div key={q} className="p-3" style={innerCard}>
                                  <p className="text-xs text-slate-400 mb-0.5">{q.replace(/_/g, ' ')}</p>
                                  <p className="text-sm text-white font-medium">{String(a)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {ss.url && (
                        <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                          style={{ background: 'rgba(6,148,162,0.1)', border: '1px solid rgba(22,189,202,0.3)' }}>
                          <svg className="h-4 w-4 shrink-0 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <p className="text-xs text-cyan-300 truncate flex-1">{ss.url}</p>
                          <button onClick={() => handleShare(report, conditions)}
                            className="shrink-0 text-xs font-semibold px-3 py-1 rounded-lg"
                            style={{ background: 'rgba(22,189,202,0.2)', color: '#7edce2', border: '1px solid rgba(22,189,202,0.3)' }}>
                            {ss.copied ? t('history.copiedBtn') : t('history.copyBtn')}
                          </button>
                        </div>
                      )}

                      {ss.error && (
                        <p className="text-xs text-red-400">{t('history.shareError')}</p>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <button onClick={() => handleShare(report, conditions)} disabled={ss.loading}
                          className="btn-secondary flex items-center gap-2 px-5 py-2.5 text-sm">
                          {ss.loading ? (
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          )}
                          {ss.copied ? t('history.copied') : ss.url ? t('history.copyLink') : t('history.shareReport')}
                        </button>

                        <button
                          onClick={() => generateReportPDF(
                            { risk_level: report.risk_level, explanation: report.summary, possible_conditions: conditions, follow_up_answers: report.follow_up_questions || {} },
                            { name: 'Patient', symptoms: report.symptoms }
                          )}
                          className="btn-secondary flex items-center gap-2 px-5 py-2.5 text-sm">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                          {t('history.downloadPDF')}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </PageShell>
  )
}
