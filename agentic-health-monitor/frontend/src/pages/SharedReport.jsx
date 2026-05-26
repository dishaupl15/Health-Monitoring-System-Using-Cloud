import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getSharedReport } from '../services/api.js'
import { generateReportPDF } from '../services/generatePDF.js'

const riskConfig = {
  Emergency: { color: '#f87171', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', icon: '🚨' },
  High:      { color: '#fb923c', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', icon: '⚠️' },
  Medium:    { color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', icon: '🔶' },
  Low:       { color: '#34d399', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', icon: '✅' },
}

const card  = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }
const inner = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem' }

export default function SharedReport() {
  const { token } = useParams()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    getSharedReport(token)
      .then(setData)
      .catch(() => setError('This report link is invalid or has expired.'))
      .finally(() => setLoading(false))
  }, [token])

  const bg = { background: 'linear-gradient(135deg, #040810 0%, #0a1628 50%, #062a3a 100%)' }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={bg}>
      <svg className="h-8 w-8 animate-spin text-cyan-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={bg}>
      <div className="text-center p-10 rounded-2xl max-w-md" style={card}>
        <div className="text-5xl mb-4">🔗</div>
        <p className="text-white font-bold text-lg mb-2">Link Not Found</p>
        <p className="text-slate-400 text-sm">{error}</p>
      </div>
    </div>
  )

  const { report, form, created_at } = data
  const risk = riskConfig[report.risk_level] || riskConfig.Low
  const followUpAnswers = report.follow_up_answers || {}

  return (
    <div className="min-h-screen" style={bg}>
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: 'rgba(6,148,162,0.12)' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(4,8,16,0.85)' }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: 'rgba(6,148,162,0.2)', border: '1px solid rgba(22,189,202,0.3)' }}>
              <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">MediAI</p>
              <p className="text-xs text-cyan-400 leading-none mt-0.5">Shared Health Report</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              {created_at ? new Date(created_at).toLocaleString() : ''}
            </span>
            <button
              onClick={() => generateReportPDF({ ...report, follow_up_answers: followUpAnswers }, form)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-cyan-400 transition-all"
              style={{ background: 'rgba(6,148,162,0.15)', border: '1px solid rgba(22,189,202,0.3)' }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pt-10 pb-16 sm:px-6 space-y-6">

        {/* Notice banner */}
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-cyan-300"
          style={{ background: 'rgba(6,148,162,0.1)', border: '1px solid rgba(22,189,202,0.25)' }}>
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          This is a read-only shared report. No login required.
        </div>

        {/* Patient info */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[['Patient', form.name], ['Age', form.age], ['Gender', form.gender], ['Severity', form.severity]].map(([label, val]) => (
            <div key={label} className="p-4 text-center" style={card}>
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="text-sm font-bold text-white">{val || '—'}</p>
            </div>
          ))}
        </div>

        {/* Risk banner */}
        <div className="rounded-2xl p-6" style={{ background: risk.bg, border: `1px solid ${risk.border}` }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{risk.icon}</div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Overall Risk Level</p>
                <p className="text-3xl font-black" style={{ color: risk.color }}>{report.risk_level}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              {[['Urgency', report.urgency], ['Confidence', report.confidence]].filter(([, v]) => v).map(([label, val]) => (
                <div key={label} className="text-right">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className="text-sm font-bold text-white">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div className="p-6" style={card}>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Reported Symptoms</p>
          <p className="text-sm text-slate-300 leading-relaxed">{form.symptoms}</p>
          {form.duration && <p className="text-xs text-slate-500 mt-2">Duration: {form.duration}</p>}
        </div>

        {/* Conditions + Explanation */}
        <div className="grid gap-6 lg:grid-cols-2">
          {report.possible_conditions?.length > 0 && (
            <div className="p-6" style={card}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Possible Conditions</p>
              <div className="space-y-3">
                {report.possible_conditions.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3" style={inner}>
                    <p className="text-sm font-semibold text-white">{c.name ?? c}</p>
                    {c.score != null && (
                      <span className="text-xs font-bold text-cyan-400">{Math.round(c.score * 100)}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {report.explanation && (
              <div className="p-6" style={card}>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Explanation</p>
                <p className="text-sm text-slate-300 leading-relaxed">{report.explanation}</p>
              </div>
            )}
            {report.recommendation && (
              <div className="p-6" style={{ ...card, borderColor: 'rgba(22,189,202,0.2)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Recommendation</p>
                <p className="text-sm text-slate-300 leading-relaxed">{report.recommendation}</p>
                {report.next_steps?.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {report.next_steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'rgba(6,148,162,0.25)', color: '#16bdca' }}>{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Follow-up answers */}
        {Object.keys(followUpAnswers).length > 0 && (
          <div className="p-6" style={card}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Follow-Up Answers</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(followUpAnswers).map(([q, a]) => (
                <div key={q} className="p-4" style={inner}>
                  <p className="text-xs font-medium text-slate-400 mb-1">{q.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-white font-medium">{String(a)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        {report.disclaimer && (
          <p className="text-xs text-slate-500 leading-relaxed text-center">⚕️ {report.disclaimer}</p>
        )}
      </div>
    </div>
  )
}
