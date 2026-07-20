export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.6 5.82c-.9-.88-1.4-2.08-1.4-3.32h-3.3v13.6a2.7 2.7 0 1 1-1.9-2.58V9.5a5.98 5.98 0 0 0-.8-.05A6 6 0 1 0 15.2 15.4V9.15a8.28 8.28 0 0 0 4.8 1.53V7.4a4.85 4.85 0 0 1-3.4-1.58z" />
    </svg>
  )
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M14 13.5h2.5l.5-3H14V8.5c0-.97.28-1.63 1.66-1.63H17V4.14C16.73 4.1 15.8 4 14.72 4 12.46 4 10.9 5.4 10.9 8.2v2.3H8.5v3h2.4V20h3.1v-6.5z" />
    </svg>
  )
}
