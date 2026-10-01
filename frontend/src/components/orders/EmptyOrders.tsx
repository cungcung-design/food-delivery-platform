import Link from "next/link";
import { ReceiptText } from "lucide-react";

export function EmptyOrders() {
  return (
    <div className="flex min-h-[450px] flex-col items-center justify-center text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-orange-50">
        <ReceiptText className="size-8 text-orange-500" />
      </div>

      <h2 className="mt-6 text-2xl font-bold">No orders yet</h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
        Once you place an order, you&apos;ll be able to track and manage it
        here.
      </p>

      <Link
        href="/restaurants"
        className="mt-6 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        Find food
      </Link>
    </div>
  );
}
