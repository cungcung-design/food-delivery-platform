"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  AlertTriangle,
  Bike,
  Bot,
  LayoutDashboard,
  LogOut,
  Store,
  Truck,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { logout } from "@/services/auth";

export const ADMIN_NAVIGATION = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Restaurants", href: "/admin/restaurants", icon: Store },
  { label: "Drivers", href: "/admin/drivers", icon: Bike },
  { label: "Operations", href: "/admin/operations", icon: Truck },
  { label: "Issues", href: "/admin/issues", icon: AlertTriangle },
  { label: "AI operations", href: "/admin/ai", icon: Bot },
];

export function isAdminNavActive(pathname: string, href: string): boolean {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
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
        <div>
          <p className="font-bold">Operations</p>
          <p className="text-xs text-zinc-500">Admin dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {ADMIN_NAVIGATION.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                isAdminNavActive(pathname, item.href) ? "page" : undefined
              }
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition",
                isAdminNavActive(pathname, item.href)
                  ? "bg-orange-50 text-orange-600"
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
          className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="size-5" />
          Log out
        </button>
      </div>
    </aside>
  );
}

/** Wide admin tables do not fit a phone, so the bar carries only the core areas. */
const MOBILE_NAVIGATION = [
  { label: "Home", href: "/admin", icon: LayoutDashboard },
  { label: "Issues", href: "/admin/issues", icon: AlertTriangle },
  { label: "Stores", href: "/admin/restaurants", icon: Store },
  { label: "Drivers", href: "/admin/drivers", icon: Truck },
  { label: "Users", href: "/admin/users", icon: Users },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="grid grid-cols-5">
        {MOBILE_NAVIGATION.map((item) => {
          const Icon = item.icon;
          const active = isAdminNavActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                active ? "text-orange-600" : "text-zinc-500",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
