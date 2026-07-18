import Link from "next/link";

const NAV = [
  { href: "/", label: "Executive Overview" },
  { href: "/methodology", label: "Methodology & Data" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 12h3.5l2-6 3.5 13 3-8 1.8 3H21"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">PulseCredit</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
