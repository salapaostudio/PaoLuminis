import Link from "next/link";
import { signOut } from "@/app/(app)/actions";

const links = [
  ["/today", "แสงวันนี้"],
  ["/ask", "แสงนำทาง"],
  ["/tarot", "ไพ่สะท้อนใจ"],
  ["/journal", "บันทึกใจ"],
  ["/saved", "สิ่งที่เก็บไว้"],
  ["/history", "ประวัติ"],
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
        <form action={signOut} className="ml-auto shrink-0">
          <button className="rounded-full border border-midnight/10 bg-white/50 px-3 py-2 text-sm text-midnight/70 hover:bg-white">
            ออกจากระบบ
          </button>
        </form>
      </nav>
    </header>
  );
}
