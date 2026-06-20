export default function Loading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <div className="route-loading-bar" aria-hidden="true" />
      <span>불러오는 중...</span>
    </div>
  );
}
