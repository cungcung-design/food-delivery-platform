"use client";

import Link from "next/link";
import {
  Bell,
  Bot,
  LogOut,
  MapPin,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

import { getCurrentUser, logout } from "@/services/auth";
import { getUnreadCount } from "@/services/notifications";
import { getCart } from "@/services/cart";

export function CustomerHeader() {
  const router = useRouter();

  const [userName, setUserName] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let stop = false;

    getCurrentUser()
      .then((data) => {
        if (!stop) {
          setUserName(data.user?.name ?? null);
        }
      })
      .catch(() => {
        if (!stop) {
          setUserName(null);
        }
      });

    return () => {
      stop = true;
    };
  }, []);

  useEffect(() => {
    let stop = false;

    function loadUnread() {
      getUnreadCount()
        .then((data) => {
          if (!stop) {
            setUnread(data.count ?? 0);
          }
        })
        .catch(() => {
          if (!stop) {
            setUnread(0);
          }
        });
    }

    function loadCart() {
      getCart()
        .then((data) => {
          if (stop) {
            return;
          }

          setCartCount(
            (data.cart?.items ?? []).reduce(
              (total, item) => total + item.quantity,
              0,
            ),
          );
        })
        .catch(() => {
          if (!stop) {
            setCartCount(0);
          }
        });
    }

    loadUnread();
    loadCart();

    const timer = window.setInterval(() => {
      loadUnread();
      loadCart();
    }, 30000);

    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);

  async function signOut() {
    await logout().catch(() => undefined);
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/95 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 lg:h-18">
          <Logo />

          <Link
            href="/checkout"
            className="hidden items-center gap-2 text-sm md:flex"
          >
            <MapPin className="size-4 text-orange-500" />

            <span className="max-w-44 truncate font-medium">
              Delivery address
            </span>
          </Link>

          <div className="hidden max-w-md flex-1 lg:block">
            <Link
              href="/restaurants"
              className="flex h-11 items-center gap-3 rounded-xl bg-zinc-100 px-4"
            >
              <Search className="size-4 text-zinc-500" />

              <span className="text-sm text-zinc-500">
                Search restaurants or food
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/assistant"
              className="rounded-xl p-3 hover:bg-zinc-100"
              aria-label="Assistant"
            >
              <Bot className="size-5" />
            </Link>

            <Link
              href="/notifications"
              className="relative rounded-xl p-3 hover:bg-zinc-100"
              aria-label={`Notifications${
                unread > 0 ? `, ${unread} unread` : ""
              }`}
            >
              <Bell className="size-5" />

              {unread > 0 && (
                <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative rounded-xl p-3 hover:bg-zinc-100"
              aria-label={`Cart${
                cartCount > 0 ? `, ${cartCount} items` : ""
              }`}
            >
              <ShoppingBag className="size-5" />

              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {userName ? (
              <div className="ml-2 flex items-center gap-2">
                <span className="max-w-32 truncate text-sm font-medium">
                  {userName}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login" className="ml-2">
                <Button>Sign in</Button>
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-1 md:hidden">
            <Link
              href="/notifications"
              className="relative rounded-xl p-2 hover:bg-zinc-100"
              aria-label="Notifications"
            >
              <Bell className="size-5" />

              {unread > 0 && (
                <span className="absolute right-0 top-0 flex min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>

            <Link
              href={userName ? "/profile" : "/login"}
              className="rounded-xl p-2 hover:bg-zinc-100"
              aria-label={userName ? "Profile" : "Sign in"}
            >
              <UserRound className="size-5" />
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}
