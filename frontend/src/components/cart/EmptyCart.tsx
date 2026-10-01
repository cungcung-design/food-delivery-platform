import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function EmptyCart() {
  return (
    <div className="flex min-h-[450px] flex-col items-center justify-center text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-orange-50">
        <ShoppingBag className="size-8 text-orange-500" />
      </div>

      <h2 className="mt-6 text-2xl font-bold">
        Your cart is empty
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
        Looks like you haven&apos;t added anything
        delicious yet.
      </p>

      <Link
        href="/restaurants"
        className="mt-6 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        Explore restaurants
      </Link>
    </div>
  );
}