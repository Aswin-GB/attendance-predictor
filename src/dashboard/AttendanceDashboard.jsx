import { useMemo, useState } from 'react'
import { WarningBanner } from '../components/WarningBanner.jsx'
import { getExpectedSectionCount, getTimetableSections } from '../data/timetable.js'
import {
  calculateClassesConducted,
  calculateClassesRemaining,
  calculateOverallAttendance,
  calculateProjectedAttendance,
  calculateRequiredAttendance,
  checkIrreversibleDetention,
  getAttendanceHealth,
} from '../calculations/attendance.js'

const fallbackSubjects = [
  { code: 'CS101', name: 'Algorithms', totalClasses: 40, attendedClasses: 31, classesConducted: 28 },
  { code: 'CS102', name: 'Operating Systems', totalClasses: 38, attendedClasses: 26, classesConducted: 26 },
  { code: 'CS103', name: 'Database Systems', totalClasses: 42, attendedClasses: 34, classesConducted: 30 },
  { code: 'CS104', name: 'Computer Networks', totalClasses: 35, attendedClasses: 24, classesConducted: 22 },
  { code: 'MATH201', name: 'Discrete Maths', totalClasses: 39, attendedClasses: 31, classesConducted: 29 },
]

const formatDate = (value) => {
  if (!value) return '—'
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const makeSubjectStatus = (subject) => {
  const currentAttended = Number(subject.attendedClasses ?? 0)
  const total = Number(subject.totalClasses ?? 0)
  const percent = total > 0 ? (currentAttended / total) * 100 : 0
  const health = getAttendanceHealth(percent)

  return {
    currentAttended,
    total,
    percent,
    health,
    classesConducted: calculateClassesConducted(subject),
    classesRemaining: calculateClassesRemaining(subject),
    required75: calculateRequiredAttendance(subject, 75),
    required90: calculateRequiredAttendance(subject, 90),
    futureProjection: calculateProjectedAttendance(subject, { futureClasses: 0, futureAttendedClasses: 0 }),
  }
}

export function AttendanceDashboard() {
  const sections = getTimetableSections().length > 0 ? getTimetableSections() : [{ id: 'A1', name: 'Section A1', subjects: fallbackSubjects }]
  const [selectedSection, setSelectedSection] = useState(sections[0]?.id ?? 'A1')
  const [selectedDate, setSelectedDate] = useState('2026-09-30')
  const [displayDate] = useState(() => new Date().toISOString().slice(0, 10))

  const section = sections.find((item) => item.id === selectedSection) ?? sections[0]

  const subjectStatuses = useMemo(
    () =>
      (section?.subjects ?? []).map((subject) => ({
        ...subject,
        status: makeSubjectStatus(subject),
      })),
    [section],
  )

  const overallAttendance = calculateOverallAttendance(subjectStatuses.map((subject) => subject))
  const overallHealth = getAttendanceHealth(overallAttendance)

  const projectedSubjects = subjectStatuses.map((subject) => {
    const futureClasses = Math.max(0, Number(subject.status.classesRemaining ?? 0))
    const futureAttendedClasses = Math.max(0, Math.ceil((subject.status.required75?.requiredClasses ?? 0) / 2))

    return {
      ...subject,
      projected: calculateProjectedAttendance(subject, {
        futureClasses,
        futureAttendedClasses,
      }),
      irreversible: checkIrreversibleDetention(subject),
    }
  })

  const hasIrreversibleDetention = projectedSubjects.some((subject) => subject.irreversible)
  const upcomingDate = selectedDate || displayDate

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">ATTENDANCE PREDICTOR</p>
          <h1>Semester performance intelligence</h1>
        </div>
        <div className="topbar-meta">
          <span>Semester: 29 Aug 2026 - 29 Nov 2026</span>
          <span>Sections: {getExpectedSectionCount()}</span>
        </div>
      </header>

      <section className="control-panel">
        <label className="field">
          <span>Class section</span>
          <select value={selectedSection} onChange={(event) => setSelectedSection(event.target.value)}>
            {sections.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Planning date</span>
          <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </label>

        <div className="field chip-field">
          <span>Today</span>
          <strong>{formatDate(displayDate)}</strong>
        </div>
      </section>

      <section className="hero-grid">
        <div className="hero-card summary-highlight">
          <span className="accent-tag">Overall attendance</span>
          <div className="big-number">{overallAttendance.toFixed(1)}%</div>
          <div className={`status-pill ${overallHealth.tone}`}>{overallHealth.label}</div>
        </div>

        <div className="hero-card metrics-grid">
          <div>
            <span>Classes conducted</span>
            <strong>{subjectStatuses.reduce((sum, subject) => sum + subject.status.classesConducted, 0)}</strong>
          </div>
          <div>
            <span>Classes remaining</span>
            <strong>{subjectStatuses.reduce((sum, subject) => sum + subject.status.classesRemaining, 0)}</strong>
          </div>
          <div>
            <span>Target 75%</span>
            <strong>{subjectStatuses.filter((subject) => subject.status.required75.attainable).length}/{subjectStatuses.length}</strong>
          </div>
          <div>
            <span>Target 90%</span>
            <strong>{subjectStatuses.filter((subject) => subject.status.required90.attainable).length}/{subjectStatuses.length}</strong>
          </div>
        </div>
      </section>

      {hasIrreversibleDetention && (
        <WarningBanner message="At least one subject cannot be rescued above 75% even if every remaining class is attended. Immediate intervention is required." />
      )}

      <section className="subject-grid">
        {subjectStatuses.map((subject) => {
          const { status } = subject
          const projected = calculateProjectedAttendance(subject, {
            futureClasses: Math.max(0, status.classesRemaining),
            futureAttendedClasses: Math.max(0, Math.ceil((status.required75.requiredClasses ?? 0) / 2)),
          })
          const irreversible = checkIrreversibleDetention(subject)

          return (
            <article key={`${subject.code}-${subject.name}`} className="subject-card">
              <div className="subject-heading">
                <div>
                  <p className="subject-code">{subject.code}</p>
                  <h3>{subject.name}</h3>
                </div>
                <span className={`mini-pill ${status.health.tone}`}>{status.health.label}</span>
              </div>

              <div className="subject-metric-row">
                <span>Current</span>
                <strong>{status.percent.toFixed(1)}%</strong>
              </div>
              <div className="subject-metric-row">
                <span>Classes conducted</span>
                <strong>{status.classesConducted}</strong>
              </div>
              <div className="subject-metric-row">
                <span>Remaining</span>
                <strong>{status.classesRemaining}</strong>
              </div>
              <div className="subject-metric-row">
                <span>Required for 75%</span>
                <strong>{status.required75.requiredClasses} classes</strong>
              </div>
              <div className="subject-metric-row">
                <span>Required for 90%</span>
                <strong>{status.required90.requiredClasses} classes</strong>
              </div>
              <div className="subject-metric-row">
                <span>Future projection</span>
                <strong>{projected.toFixed(1)}%</strong>
              </div>

              {irreversible && <div className="subject-warning">IRREVERSIBLE DETENTION</div>}
            </article>
          )
        })}
      </section>

      <section className="insights-grid">
        <div className="insight-card">
          <h4>Planning window</h4>
          <p>Target date: {formatDate(upcomingDate)}</p>
          <p>Today: {formatDate(displayDate)}</p>
        </div>

        <div className="insight-card">
          <h4>Semester progress</h4>
          <p>Classes already conducted: {subjectStatuses.reduce((sum, subject) => sum + subject.status.classesConducted, 0)}</p>
          <p>Remaining to semester end: {subjectStatuses.reduce((sum, subject) => sum + subject.status.classesRemaining, 0)}</p>
        </div>
      </section>
    </div>
  )
}
