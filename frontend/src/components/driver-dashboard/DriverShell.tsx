"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bike, LogOut, X } from "lucide-react";

import {
  DriverDashboardProvider,
  useDriverDashboard,
} from "@/hooks/useDriverDashboard";
import { cn } from "@/lib/utils";
import { logout } from "@/services/auth";
import { DriverHeader } from "./DriverHeader";
import {
  DRIVER_NAVIGATION,
  DriverBottomNav,
  DriverSidebar,
  isDriverNavActive,
} from "./DriverSidebar";

function DriverMobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout().catch(() => undefined);
    router.push("/login");
    router.refresh();
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <aside className="relative flex h-full w-[85%] max-w-80 flex-col bg-white shadow-xl">
        <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
              <Bike className="size-4" />
            </div>

            <span className="font-bold">Driver</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex size-11 items-center justify-center rounded-xl hover:bg-zinc-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {DRIVER_NAVIGATION.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={
                  isDriverNavActive(pathname, item.href) ? "page" : undefined
                }
                className={cn(
                  "flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium",
                  isDriverNavActive(pathname, item.href)
                    ? "bg-orange-50 text-orange-700"
                    : "text-zinc-600 hover:bg-zinc-50",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-100 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="size-5" />
            Log out
          </button>
        </div>
      </aside>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { error } = useDriverDashboard();

  return (
    <div className="min-h-dvh bg-zinc-50">
      <DriverSidebar />

      <DriverMobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="lg:pl-64">
        <DriverHeader onMenuOpen={() => setMobileNavOpen(true)} />

        <main className="p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
          {error && (
            <p className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          )}

          {children}
        </main>
      </div>

      <DriverBottomNav />
    </div>
  );
}

export function DriverShell({ children }: { children: ReactNode }) {
  return (
    <DriverDashboardProvider>
      <Shell>{children}</Shell>
    </DriverDashboardProvider>
  );
}