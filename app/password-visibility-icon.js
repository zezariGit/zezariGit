export default function PasswordVisibilityIcon({ visible }) {
  return visible ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" />
      <circle cx="12" cy="12" r="2.4" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 3 21 21" />
      <path d="M10.6 7.1C11.05 7.03 11.52 7 12 7c6 0 9.5 5 9.5 5a15.5 15.5 0 0 1-2.3 2.7M6.2 6.2C3.85 7.68 2.5 12 2.5 12s3.5 5 9.5 5c1.45 0 2.72-.29 3.83-.74M9.9 9.9A3 3 0 0 0 14.1 14.1" />
    </svg>
  );
}
