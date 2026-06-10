import Link from "next/link";

const links = [
  ["/today", "Daily Light"],
  ["/ask", "Ask AI"],
  ["/tarot", "Symbol Card"],
  ["/journal", "Journal"],
  ["/saved", "Saved"],
  ["/history", "History"],
];

export function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/60 bg-cream/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-3">
        <Link href="/" className="mr-2 shrink-0 font-semibold text-midnight">
          PaoLuminis
        </Link>
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="shrink-0 rounded-full px-3 py-2 text-sm text-midnight/70 hover:bg-white/70">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
