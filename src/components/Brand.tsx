import Link from "next/link";

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#1c1b1a" stroke="#423d39" />
      {/* "locked on target" reticle — locked in */}
      <g stroke="url(#lg)" strokeWidth="2" strokeLinecap="round">
        {/* corner brackets */}
        <path d="M9 12V9.5A.5.5 0 0 1 9.5 9H12" />
        <path d="M20 9h2.5a.5.5 0 0 1 .5.5V12" />
        <path d="M23 20v2.5a.5.5 0 0 1-.5.5H20" />
        <path d="M12 23H9.5a.5.5 0 0 1-.5-.5V20" />
        {/* crosshair ticks */}
        <path d="M16 11.5v2M16 18.5v2M11.5 16h2M18.5 16h2" />
      </g>
      <circle cx="16" cy="16" r="3.4" stroke="url(#lg)" strokeWidth="2" />
      <circle cx="16" cy="16" r="1.4" fill="url(#lg)" />
      <defs>
        <linearGradient id="lg" x1="9" y1="9" x2="23" y2="23">
          <stop stopColor="#e08a52" />
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
