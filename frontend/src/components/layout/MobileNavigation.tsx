"use client";

import Link from "next/link";
import {
  Bot,
  Home,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Explore",
    href: "/restaurants",
    icon: Search,
  },
  {
    label: "Assistant",
    href: "/assistant",
    icon: Bot,
  },
  {
    label: "Cart",
    href: "/cart",
    icon: ShoppingBag,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white md:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium",
                active ? "text-orange-600" : "text-zinc-600",
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
