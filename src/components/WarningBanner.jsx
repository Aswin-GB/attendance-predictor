export function WarningBanner({ message }) {
  return (
    <div className="warning-banner" role="alert">
      <span className="warning-badge">IRREVERSIBLE DETENTION</span>
      <p>{message}</p>
    </div>
  )
}
