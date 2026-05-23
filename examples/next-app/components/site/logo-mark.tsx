export function RevealLogoMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        className="fill-secondary stroke-border"
        height="64"
        rx="14"
        strokeWidth="1"
        width="64"
      />
      <rect
        className="fill-background stroke-border"
        height="14"
        rx="4"
        strokeWidth="1.5"
        width="36"
        x="14"
        y="16"
      />
      <rect
        className="fill-accent/15 stroke-accent/50"
        height="14"
        rx="4"
        strokeWidth="1.5"
        width="36"
        x="14"
        y="34"
      />
      <path
        className="stroke-foreground"
        d="M22 23h20M20 41h24"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
    </svg>
  )
}
