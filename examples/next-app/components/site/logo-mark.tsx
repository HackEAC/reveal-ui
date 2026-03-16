export function RevealLogoMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="#F7F3EA" height="64" rx="20" width="64" />
      <rect
        fill="#0F766E"
        fillOpacity=".12"
        height="16"
        rx="8"
        stroke="#0F766E"
        strokeWidth="2"
        width="40"
        x="12"
        y="14"
      />
      <rect
        fill="#FFFFFF"
        height="16"
        rx="8"
        stroke="#CBD5E1"
        strokeWidth="2"
        width="40"
        x="12"
        y="34"
      />
      <path d="M24 22h16M22 42h20" stroke="#0F172A" strokeLinecap="round" strokeWidth="3" />
    </svg>
  )
}
