"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { formatMoney } from "@/lib/format";

interface MobileCartBarProps {
  itemCount: number;
  total: string;
}

export function MobileCartBar({
  itemCount,
  total,
}: MobileCartBarProps) {
  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 px-4 md:hidden">
      <Link
        href="/cart"
        className="flex h-14 items-center justify-between gap-3 rounded-2xl bg-zinc-950 px-5 text-white shadow-lg"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <ShoppingBag className="size-4 text-orange-400" />
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>

        <span className="font-bold">{formatMoney(total)}</span>
      </Link>
    </div>
  );
}
