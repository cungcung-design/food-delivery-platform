"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Bike,
  CircleDollarSign,
  History,
  LayoutDashboard,
  LogOut,
  Package,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { logout } from "@/services/auth";

export const DRIVER_NAVIGATION = [
  { label: "Overview", href: "/driver", icon: LayoutDashboard },
  { label: "Deliveries", href: "/driver/deliveries", icon: Package },
  { label: "History", href: "/driver/history", icon: History },
  { label: "Earnings", href: "/driver/earnings", icon: CircleDollarSign },
];

export function isDriverNavActive(pathname: string, href: string): boolean {
  return href === "/driver"
    ? pathname === "/driver"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function DriverSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout().catch(() => undefined);
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-zinc-200 bg-white lg:flex">
      <div className="flex h-20 items-center border-b border-zinc-100 px-6">
        <Link href="/driver" className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
            <Bike className="size-5" />
          </div>

          <div>
            <p className="font-bold">Driver</p>
            <p className="text-xs text-zinc-500">Courier dashboard</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {DRIVER_NAVIGATION.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                isDriverNavActive(pathname, item.href) ? "page" : undefined
              }
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                isDriverNavActive(pathname, item.href)
                  ? "bg-orange-50 text-orange-700"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950",
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
          className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="size-5" />
          Log out
        </button>
      </div>
    </aside>
  );
}

export function DriverBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-zinc-200 bg-white lg:hidden">
      {DRIVER_NAVIGATION.map((item) => {
        const Icon = item.icon;
        const active = isDriverNavActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold",
              active ? "text-orange-600" : "text-zinc-500",
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}