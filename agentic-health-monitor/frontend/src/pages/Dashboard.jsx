import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts'
import PageShell from '../components/PageShell.jsx'
import { supabase } from '../lib/supabaseClient.js'

const riskOrder = { Low: 1, Medium: 2, High: 3, Emergency: 4 }
const riskColor = { Low: '#34d399', Medium: '#fbbf24', High: '#fb923c', Emergency: '#f87171' }
const cardStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }

function RiskDot({ cx, cy, payload }) {
  const color = riskColor[payload.risk_level] || '#7edce2'
  return <circle cx={cx} cy={cy} r={6} fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
}

function CustomTooltip({ active, payload, riskLabel }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const color = riskColor[d.risk_level] || '#7edce2'
  return (
    <div className="rounded-xl p-3 text-xs shadow-xl"
      style={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(255,255,255,0.12)', minWidth: 180 }}>
      <p className="text-slate-400 mb-1">{d.date}</p>
      <p className="font-bold mb-1" style={{ color }}>{d.risk_level} {riskLabel}</p>
      <p className="text-slate-300 leading-relaxed line-clamp-2">{d.symptoms}</p>
    </div>
  )
}

function StatCard({ label, value, color, sub }) {
  return (
    <div className="p-5 text-center" style={cardStyle}>
      <p className="text-2xl font-black" style={{ color: color || '#fff' }}>{value}</p>
      <p className="text-xs font-semibold text-brand-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setError(t('common.notLoggedIn')); setLoading(false); return }
      supabase
        .from('assessments')
        .select('id, risk_level, symptoms, summary, possible_conditions, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true })
        .then(({ data: rows, error: err }) => {
          if (err) { setError(err.message); return }
          setData((rows || []).map((r, i) => ({
            index: i + 1,
            id: r.id,
            risk_level: r.risk_level || 'Low',
            risk_score: riskOrder[r.risk_level] || 1,
            symptoms: r.symptoms || '',
            summary: r.summary || '',
            possible_conditions: Array.isArray(r.possible_conditions) ? r.possible_conditions : [],
            date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            fullDate: new Date(r.created_at).toLocaleString(),
          })))
        })
        .finally(() => setLoading(false))
    })
  }, [])

  const counts = { Low: 0, Medium: 0, High: 0, Emergency: 0 }
  data.forEach(d => { if (counts[d.risk_level] !== undefined) counts[d.risk_level]++ })
  const latest = data[data.length - 1]
  const latestColor = latest ? riskColor[latest.risk_level] : '#7edce2'

  const riskLabelMap = {
    Low:       t('dashboard.riskLow'),
    Medium:    t('dashboard.riskMedium'),
    High:      t('dashboard.riskHigh'),
    Emergency: t('dashboard.riskEmergency'),
  }
  const yTicks = [1, 2, 3, 4]
  const yTickFormatter = (v) => ({ 1: riskLabelMap.Low, 2: riskLabelMap.Medium, 3: riskLabelMap.High, 4: riskLabelMap.Emergency }[v] || '')

  return (
    <PageShell title={t('dashboard.title')} description={t('dashboard.description')}>
      <div className="space-y-6">

        {loading ? (
          <div className="p-12 text-center" style={cardStyle}>
            <svg className="h-8 w-8 animate-spin text-brand-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-slate-400 text-sm">{t('dashboard.loadingData')}</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            {error}
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center" style={cardStyle}>
            <div className="text-5xl mb-4">📈</div>
            <p className="text-white font-semibold mb-2">{t('dashboard.noAssessments')}</p>
            <p className="text-sm text-slate-400 mb-6">{t('dashboard.noAssessmentsDesc')}</p>
            <button onClick={() => navigate('/symptom-form')} className="btn-primary">{t('dashboard.startAssessment')}</button>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label={t('dashboard.totalAssessments')} value={data.length} />
              <StatCard label={t('dashboard.latestRisk')} value={latest?.risk_level || '—'} color={latestColor} sub={latest?.date} />
              <StatCard label={t('dashboard.highEmergency')} value={counts.High + counts.Emergency} color="#fb923c" sub={t('dashboard.highEmergencySub')} />
              <StatCard label={t('dashboard.lowRisk')} value={counts.Low} color="#34d399" sub={t('dashboard.lowRiskSub')} />
            </div>

            {/* Line chart */}
            <div className="p-6" style={cardStyle}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-white font-semibold">{t('dashboard.riskOverTime')}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t('dashboard.riskOverTimeDesc')}</p>
                </div>
                <div className="hidden sm:flex items-center gap-4">
                  {Object.entries(riskColor).map(([level, color]) => (
                    <div key={level} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                      <span className="text-xs text-slate-400">{riskLabelMap[level] || level}</span>
                    </div>
                  ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0694a2" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0694a2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0.5, 4.5]}
                    ticks={yTicks}
                    tickFormatter={yTickFormatter}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={72}
                  />
                  <Tooltip content={<CustomTooltip riskLabel={t('dashboard.riskLabel')} />} />
                  <ReferenceLine y={3} stroke="rgba(251,146,60,0.2)" strokeDasharray="4 4" />
                  <ReferenceLine y={4} stroke="rgba(248,113,113,0.2)" strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="risk_score"
                    stroke="#0694a2"
                    strokeWidth={2.5}
                    fill="url(#riskGrad)"
                    dot={<RiskDot />}
                    activeDot={{ r: 8, fill: '#16bdca', stroke: 'rgba(0,0,0,0.3)', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Risk breakdown */}
            <div className="p-6" style={cardStyle}>
              <p className="text-white font-semibold mb-1">{t('dashboard.riskBreakdown')}</p>
              <p className="text-xs text-slate-500 mb-5">{t('dashboard.riskBreakdownDesc')}</p>
              <div className="space-y-6">
                {Object.entries(counts).map(([level, count]) => {
                  const pct = data.length > 0 ? Math.round((count / data.length) * 100) : 0
                  const levelReports = [...data].reverse().filter(d => d.risk_level === level)
                  return (
                    <div key={level}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ background: riskColor[level] }} />
                          <span className="text-sm font-semibold" style={{ color: riskColor[level] }}>{riskLabelMap[level] || level}</span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {count} {count !== 1 ? t('dashboard.assessmentCountPlural') : t('dashboard.assessmentCount')} · {pct}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: riskColor[level] }} />
                      </div>

                      {levelReports.length > 0 && (
                        <div className="space-y-2 pl-4 border-l-2" style={{ borderColor: `${riskColor[level]}40` }}>
                          {levelReports.map((r) => {
                            const topCondition = r.possible_conditions
                              .sort((a, b) => (b.score || 0) - (a.score || 0))[0]
                            return (
                              <div key={r.id} className="p-3 rounded-xl"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <div className="flex items-start justify-between gap-3 mb-1.5">
                                  <p className="text-xs font-semibold text-white leading-snug line-clamp-1">{r.symptoms}</p>
                                  <span className="text-xs text-slate-500 shrink-0">{r.date}</span>
                                </div>
                                {r.summary && (
                                  <p className="text-xs text-slate-400 leading-relaxed mb-2 line-clamp-2">{r.summary}</p>
                                )}
                                {topCondition && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs">🔬</span>
                                    <span className="text-xs text-slate-300 font-medium">{topCondition.name}</span>
                                    <span className="text-xs font-bold" style={{ color: riskColor[level] }}>
                                      — {Math.round((topCondition.score || 0) * 100)}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent trend summary */}
            {data.length >= 2 && (() => {
              const prev = data[data.length - 2]
              const curr = data[data.length - 1]
              const improved = riskOrder[curr.risk_level] < riskOrder[prev.risk_level]
              const worsened = riskOrder[curr.risk_level] > riskOrder[prev.risk_level]
              return (
                <div className="flex items-center gap-4 p-5 rounded-2xl"
                  style={{
                    background: improved ? 'rgba(16,185,129,0.08)' : worsened ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${improved ? 'rgba(52,211,153,0.25)' : worsened ? 'rgba(248,113,113,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  <div className="text-3xl">{improved ? '📉' : worsened ? '📈' : '➡️'}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {improved ? t('dashboard.improved') : worsened ? t('dashboard.worsened') : t('dashboard.unchanged')}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {prev.risk_level} → {curr.risk_level} · {prev.date} {t('common.to')} {curr.date}
                    </p>
                  </div>
                </div>
              )
            })()}
          </>
        )}
      </div>
    </PageShell>
  )
}
