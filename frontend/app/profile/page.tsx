"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

import { getCurrentUser, logout } from "@/services/auth";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void getCurrentUser()
        .then((data) => setUser(data.user ?? null))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function signOut() {
    await logout().catch(() => undefined);
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <CustomerLayout>
        <Container className="py-20 text-center text-sm text-zinc-500">
          Loading profile...
        </Container>
      </CustomerLayout>
    );
  }

  if (!user) {
    return (
      <CustomerLayout>
        <Container className="py-20 text-center">
          <h1 className="text-2xl font-bold">Sign in required</h1>

          <p className="mt-2 text-sm text-zinc-500">
            Sign in to view your account.
          </p>

          <Link href="/login" className="mt-6 inline-block">
            <Button>Sign in</Button>
          </Link>
        </Container>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <Container className="py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold text-orange-500">Account</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Profile
          </h1>

          <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xl font-bold text-orange-600">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold">
                  {user.name}
                </h2>

                <p className="truncate text-sm text-zinc-500">
                  {user.email}
                </p>

                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {user.role}
                </p>
              </div>
            </div>
          </section>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href="/orders"
              className="flex h-12 items-center justify-center rounded-xl border border-zinc-200 text-sm font-semibold transition hover:bg-zinc-50"
            >
              Your orders
            </Link>

            <Link
              href="/addresses"
              className="flex h-12 items-center justify-center rounded-xl border border-zinc-200 text-sm font-semibold transition hover:bg-zinc-50"
            >
              Delivery addresses
            </Link>
          </div>

          <Button
            variant="secondary"
            className="mt-5 w-full"
            onClick={signOut}
          >
            Sign out
          </Button>
        </div>
      </Container>
    </CustomerLayout>
  );
}
