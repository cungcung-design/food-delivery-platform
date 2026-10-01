"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, X } from "lucide-react";

import {
  RESTAURANT_NAVIGATION,
  isNavActive,
} from "./RestaurantSidebar";
import { cn } from "@/lib/utils";
import { useOwnerRestaurant } from "@/hooks/useOwnerRestaurant";

interface RestaurantMobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function RestaurantMobileNav({
  open,
  onClose,
}: RestaurantMobileNavProps) {
  const pathname = usePathname();
  const { restaurant } = useOwnerRestaurant();

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
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
              <Store className="size-4" />
            </div>

            <span className="truncate font-bold">
              {restaurant?.name ?? "Restaurant"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl hover:bg-zinc-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {RESTAURANT_NAVIGATION.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={
                  isNavActive(pathname, item.href) ? "page" : undefined
                }
                className={cn(
                  "flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium",
                  isNavActive(pathname, item.href)
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
      </aside>
    </div>
  );
}