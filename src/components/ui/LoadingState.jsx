export default function LoadingState({ label = 'جارٍ التحميل…' }) {
  return <div className="loading-state" role="status" aria-live="polite">{label}</div>;
}
