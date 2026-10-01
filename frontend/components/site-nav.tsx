"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getUnreadCount } from "@/services/notifications";

export function SiteNav() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let stop = false;

    function load() {
      getUnreadCount()
        .then((data) => {
          if (!stop) {
            setCount(data.count ?? 0);
          }
        })
        .catch(() => {
          if (!stop) {
            setCount(0);
          }
        });
    }

    load();
    const timer = window.setInterval(load, 30000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <nav className="mb-8 flex flex-wrap gap-4 text-sm">
      <Link href="/restaurants">Restaurants</Link>
      <Link href="/cart">Cart</Link>
      <Link href="/orders">Orders</Link>
      <Link href="/assistant">Assistant</Link>
      <Link href="/admin">Operations</Link>
      <Link href="/notifications">{count > 0 ? `🔔 ${count}` : "🔔"}</Link>
      <Link href="/restaurant">Restaurant</Link>
      <Link href="/driver">Driver</Link>
      <Link href="/login">Login</Link>
    </nav>
  );
}
