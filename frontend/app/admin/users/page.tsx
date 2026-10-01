"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { Info } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-sm font-semibold text-orange-500">Operations</p>

      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        Users
      </h1>

      <p className="mt-2 text-sm text-zinc-500">
        Platform user accounts and roles.
      </p>

      <div className="mt-8">
        <EmptyState
          icon={<Info className="size-6 text-zinc-500" />}
          title="No user listing endpoint"
          description="The API exposes no endpoint that lists user accounts for admins, so no user table is rendered here. Adding one requires a backend change."
        />
      </div>
    </div>
  );
}
