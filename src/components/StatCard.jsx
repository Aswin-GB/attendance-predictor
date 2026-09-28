export function StatCard({ label, value, accent = 'neutral' }) {
  return (
    <div className={`stat-card accent-${accent}`}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
    </div>
  )
}
