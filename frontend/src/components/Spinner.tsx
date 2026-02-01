function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-brand-500/20 border-t-brand-500"
      style={{ width: size, height: size }}
      aria-label="Loading"
      role="status"
    />
  )
}

export default Spinner
