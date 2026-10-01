import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";

export function EmptyMenu() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-zinc-100">
        <UtensilsCrossed className="size-7 text-zinc-500" />
      </div>

      <h2 className="mt-5 text-xl font-bold">No menu items found</h2>

      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        There are no menu items matching your current search or category
        filter.
      </p>

      <Link
        href="/restaurant/menu/new"
        className="mt-5 flex h-11 items-center rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        Add your first item
      </Link>
    </div>
  );
}