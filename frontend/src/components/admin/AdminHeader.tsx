"use client";

import Link from "next/link";
import { Bell, ShieldCheck } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <div>
          <p className="font-bold lg:hidden">Operations</p>

          <p className="hidden text-sm text-zinc-500 lg:block">
            Platform operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="flex size-11 items-center justify-center rounded-xl hover:bg-zinc-100"
          >
            <Bell className="size-5" />
          </Link>

          <div className="flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2">
            <ShieldCheck className="size-4" />

            <span className="hidden text-sm font-semibold sm:inline">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
