import { jsPDF } from 'jspdf'

export function generateReportPDF(report, form) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 18
  const contentW = W - margin * 2
  let y = 0

  const colors = {
    Emergency: [239, 68, 68],
    High: [249, 115, 22],
    Medium: [245, 158, 11],
    Low: [16, 185, 129],
  }
  const riskColor = colors[report.risk_level] || colors.Low

  // Header bar
  doc.setFillColor(...riskColor)
  doc.rect(0, 0, W, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Agentic Health Monitor', margin, 11)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('AI-Generated Health Assessment Report', margin, 18)
  doc.text(new Date().toLocaleString(), W - margin, 18, { align: 'right' })
  y = 36

  // Patient info row
  doc.setFillColor(245, 247, 250)
  doc.roundedRect(margin, y, contentW, 18, 3, 3, 'F')
  doc.setTextColor(60, 60, 80)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  const patientFields = [
    ['Patient', form.name || '—'],
    ['Age', form.age || '—'],
    ['Gender', form.gender || '—'],
    ['Duration', form.duration || '—'],
    ['Severity', form.severity || '—'],
  ]
  const colW = contentW / patientFields.length
  patientFields.forEach(([label, val], i) => {
    const x = margin + i * colW + colW / 2
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 100, 130)
    doc.text(label, x, y + 6, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 50)
    doc.text(String(val), x, y + 13, { align: 'center' })
  })
  y += 26

  // Risk level badge
  doc.setFillColor(...riskColor)
  doc.roundedRect(margin, y, contentW, 16, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Risk Level: ${report.risk_level}`, margin + 6, y + 7)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  if (report.urgency) doc.text(`Urgency: ${report.urgency}`, margin + 6, y + 13)
  if (report.confidence) doc.text(`Confidence: ${report.confidence}`, W - margin - 6, y + 10, { align: 'right' })
  y += 22

  const addSection = (title, content) => {
    if (!content) return
    if (y > 260) { doc.addPage(); y = 18 }
    doc.setFillColor(230, 235, 245)
    doc.rect(margin, y, contentW, 7, 'F')
    doc.setTextColor(40, 40, 80)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin + 3, y + 5)
    y += 10
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 70)
    doc.setFontSize(8.5)
    const lines = doc.splitTextToSize(String(content), contentW - 4)
    lines.forEach(line => {
      if (y > 275) { doc.addPage(); y = 18 }
      doc.text(line, margin + 3, y)
      y += 5
    })
    y += 4
  }

  addSection('Symptoms', form.symptoms)
  addSection('Clinical Summary / Explanation', report.explanation)
  addSection('Recommendation', report.recommendation)

  // Possible conditions
  if (report.possible_conditions?.length > 0) {
    if (y > 250) { doc.addPage(); y = 18 }
    doc.setFillColor(230, 235, 245)
    doc.rect(margin, y, contentW, 7, 'F')
    doc.setTextColor(40, 40, 80)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Possible Conditions', margin + 3, y + 5)
    y += 10
    report.possible_conditions.forEach((c, i) => {
      if (y > 275) { doc.addPage(); y = 18 }
      const name = c.name ?? String(c)
      const pct = c.score != null ? ` — ${Math.round(c.score * 100)}%` : ''
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(50, 50, 70)
      doc.text(`${i + 1}. ${name}${pct}`, margin + 3, y)
      y += 5
    })
    y += 4
  }

  // Next steps
  if (report.next_steps?.length > 0) {
    if (y > 250) { doc.addPage(); y = 18 }
    doc.setFillColor(230, 235, 245)
    doc.rect(margin, y, contentW, 7, 'F')
    doc.setTextColor(40, 40, 80)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Next Steps', margin + 3, y + 5)
    y += 10
    report.next_steps.forEach((step, i) => {
      if (y > 275) { doc.addPage(); y = 18 }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(50, 50, 70)
      const lines = doc.splitTextToSize(`${i + 1}. ${step}`, contentW - 4)
      lines.forEach(line => {
        if (y > 275) { doc.addPage(); y = 18 }
        doc.text(line, margin + 3, y)
        y += 5
      })
    })
    y += 4
  }

  // Follow-up answers
  const followUpAnswers = report.follow_up_answers || {}
  if (Object.keys(followUpAnswers).length > 0) {
    if (y > 250) { doc.addPage(); y = 18 }
    doc.setFillColor(230, 235, 245)
    doc.rect(margin, y, contentW, 7, 'F')
    doc.setTextColor(40, 40, 80)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Follow-Up Answers', margin + 3, y + 5)
    y += 10
    Object.entries(followUpAnswers).forEach(([q, a]) => {
      if (y > 270) { doc.addPage(); y = 18 }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(80, 80, 110)
      const qLines = doc.splitTextToSize(q.replace(/_/g, ' '), contentW - 4)
      qLines.forEach(line => { doc.text(line, margin + 3, y); y += 4.5 })
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(30, 30, 50)
      const aLines = doc.splitTextToSize(String(a), contentW - 8)
      aLines.forEach(line => { doc.text(line, margin + 6, y); y += 4.5 })
      y += 2
    })
    y += 2
  }

  // Disclaimer
  if (report.disclaimer) {
    if (y > 265) { doc.addPage(); y = 18 }
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(130, 130, 150)
    const lines = doc.splitTextToSize(`⚕ ${report.disclaimer}`, contentW)
    lines.forEach(line => { doc.text(line, margin, y); y += 4 })
  }

  // Footer on every page
  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFillColor(245, 247, 250)
    doc.rect(0, 287, W, 10, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(130, 130, 150)
    doc.text('This report is AI-generated and not a substitute for professional medical advice.', margin, 293)
    doc.text(`Page ${p} of ${totalPages}`, W - margin, 293, { align: 'right' })
  }

  const safeName = (form.name || 'patient').replace(/\s+/g, '_')
  doc.save(`health_report_${safeName}_${Date.now()}.pdf`)
}
