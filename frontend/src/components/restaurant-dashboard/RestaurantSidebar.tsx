"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  LogOut,
  Package,
  Store,
  UtensilsCrossed,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { logout } from "@/services/auth";

// Only routes that exist are linked, so no dashboard item leads to a 404.
export const RESTAURANT_NAVIGATION = [
  {
    label: "Overview",
    href: "/restaurant",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    href: "/restaurant/orders",
    icon: Package,
  },
  {
    label: "Menu",
    href: "/restaurant/menu",
    icon: UtensilsCrossed,
  },
];

export function isNavActive(
  pathname: string,
  href: string,
): boolean {
  return href === "/restaurant"
    ? pathname === "/restaurant"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function RestaurantSidebar({
  restaurantName,
}: {
  restaurantName?: string;
}) {
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
        <Link href="/restaurant" className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
            <Store className="size-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate font-bold">
              {restaurantName ?? "Restaurant"}
            </p>

            <p className="text-xs text-zinc-500">Partner dashboard</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {RESTAURANT_NAVIGATION.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                isNavActive(pathname, item.href) ? "page" : undefined
              }
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                isNavActive(pathname, item.href)
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