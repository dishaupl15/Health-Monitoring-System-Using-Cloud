import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageShell from '../components/PageShell.jsx'
import { analyzeSymptoms } from '../services/api.js'

const initialForm = {
  name: '', age: '', gender: 'female', symptoms: '',
  duration: '', severity: 'mild', history: '', bp: '', sugar: '', temperature: '',
}

const cardStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }
const stepBadge = { background: 'rgba(6,148,162,0.2)', border: '1px solid rgba(22,189,202,0.3)', borderRadius: '0.375rem' }

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="label-text mb-2 block">
        {label} {required && <span className="text-brand-400">*</span>}
      </span>
      {children}
    </label>
  )
}

export default function SymptomForm() {
  const { t } = useTranslation()
  const [form, setForm] = useState(initialForm)
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((c) => ({ ...c, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, age: Number(form.age) }
      const response = await analyzeSymptoms(payload)
      navigate('/follow-up', { state: { form: payload, analysis: response } })
    } catch (err) {
      setError(err.message || t('common.analyzeError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell title={t('symptomForm.title')} description={t('symptomForm.description')}>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Personal Info */}
        <div className="p-6" style={cardStyle}>
          <h2 className="section-title mb-5 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center text-brand-400 text-xs font-bold" style={stepBadge}>1</span>
            {t('symptomForm.step1')}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label={t('symptomForm.fullName')} required>
              <input name="name" value={form.name} onChange={handleChange} required placeholder={t('symptomForm.namePlaceholder')} className="input-field" />
            </Field>
            <Field label={t('symptomForm.age')} required>
              <input type="number" name="age" value={form.age} onChange={handleChange} required min="1" placeholder={t('symptomForm.agePlaceholder')} className="input-field" />
            </Field>
            <Field label={t('symptomForm.gender')}>
              <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                <option value="female">{t('symptomForm.female')}</option>
                <option value="male">{t('symptomForm.male')}</option>
                <option value="other">{t('symptomForm.other')}</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Symptoms */}
        <div className="p-6" style={cardStyle}>
          <h2 className="section-title mb-5 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center text-brand-400 text-xs font-bold" style={stepBadge}>2</span>
            {t('symptomForm.step2')}
          </h2>
          <div className="space-y-5">
            <Field label={t('symptomForm.symptoms')} required>
              <textarea name="symptoms" value={form.symptoms} onChange={handleChange} required rows={4}
                placeholder={t('symptomForm.symptomsPlaceholder')} className="input-field resize-none" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('symptomForm.duration')} required>
                <input name="duration" value={form.duration} onChange={handleChange} required placeholder={t('symptomForm.durationPlaceholder')} className="input-field" />
              </Field>
              <Field label={t('symptomForm.severity')}>
                <select name="severity" value={form.severity} onChange={handleChange} className="input-field">
                  <option value="mild">{t('symptomForm.mild')}</option>
                  <option value="moderate">{t('symptomForm.moderate')}</option>
                  <option value="severe">{t('symptomForm.severe')}</option>
                </select>
              </Field>
            </div>
            <Field label={t('symptomForm.history')}>
              <input name="history" value={form.history} onChange={handleChange} placeholder={t('symptomForm.historyPlaceholder')} className="input-field" />
            </Field>
          </div>
        </div>

        {/* Vitals */}
        <div className="p-6" style={cardStyle}>
          <h2 className="section-title mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center text-brand-400 text-xs font-bold" style={stepBadge}>3</span>
            {t('symptomForm.step3')}
            <span className="text-xs font-normal text-slate-500 ml-1">{t('symptomForm.vitalsOptional')}</span>
          </h2>
          <p className="text-xs text-slate-500 mb-5">{t('symptomForm.vitalsHint')}</p>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label={t('symptomForm.bp')}>
              <input name="bp" value={form.bp} onChange={handleChange} placeholder={t('symptomForm.bpPlaceholder')} className="input-field" />
            </Field>
            <Field label={t('symptomForm.sugar')}>
              <input name="sugar" value={form.sugar} onChange={handleChange} placeholder={t('symptomForm.sugarPlaceholder')} className="input-field" />
            </Field>
            <Field label={t('symptomForm.temperature')}>
              <input name="temperature" value={form.temperature} onChange={handleChange} placeholder={t('symptomForm.tempPlaceholder')} className="input-field" />
            </Field>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button type="submit" disabled={isLoading} className="btn-primary px-8 py-3.5">
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('symptomForm.submitting')}
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('symptomForm.submit')}
              </>
            )}
          </button>
          <p className="text-xs text-slate-500">{t('symptomForm.hint')}</p>
        </div>
      </form>
    </PageShell>
  )
}
