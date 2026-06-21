import Link from "next/link";

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#1c1b1a" stroke="#423d39" />
      {/* padlock — "lock in" */}
      <path
        d="M11 14v-1.5a5 5 0 0 1 10 0V14"
        stroke="url(#lg)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="9.5" y="14" width="13" height="10.5" rx="2.5" fill="url(#lg)" />
      <circle cx="16" cy="18.4" r="1.5" fill="#1c1b1a" />
      <rect x="15.2" y="19.2" width="1.6" height="3" rx="0.8" fill="#1c1b1a" />
      <defs>
        <linearGradient id="lg" x1="9" y1="8" x2="23" y2="25">
          <stop stopColor="#cf7945" />
          <stop offset="1" stopColor="#b5683c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 group">
      <Logo />
      <div className="leading-none">
        <div className="font-display text-[17px] text-bone tracking-tight">
          Lock In
        </div>
        <div className="text-[10px] text-bone-faint tracking-[0.2em] uppercase mt-0.5">
          Placement Studio
        </div>
      </div>
    </Link>
  );
}
