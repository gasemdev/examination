import Link from "next/link";
import { StarFilled } from "@ant-design/icons";

export function BrandMark({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className={compact ? "grid size-14 place-items-center rounded-full border-2 border-[#7063f4] bg-[rgba(102,88,232,0.2)] text-2xl text-[#f5b835] shadow-[0_0_24px_rgba(102,88,232,0.35)]" : "flex items-center gap-3 font-semibold tracking-tight"}>
      <span className={compact ? "" : "grid size-9 place-items-center rounded-xl bg-[var(--primary)] text-lg shadow-[0_6px_18px_rgba(102,88,232,0.35)]"}><StarFilled /></span>
      {!compact && <span>Examio</span>}
    </Link>
  );
}
