"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { Info } from "lucide-react";

export default function AdminDriversPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-sm font-semibold text-orange-500">Operations</p>

      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        Drivers
      </h1>

      <p className="mt-2 text-sm text-zinc-500">
        Driver availability and activity.
      </p>

      <div className="mt-8">
        <EmptyState
          icon={<Info className="size-6 text-zinc-500" />}
          title="No driver roster endpoint"
          description="Drivers can only see their own profile, and no admin endpoint lists the driver fleet. The operations report still reports how many drivers are available."
        />
      </div>
    </div>
  );
}
