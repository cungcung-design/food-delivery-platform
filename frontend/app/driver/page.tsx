"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { DriverAvailability } from "@/components/driver-dashboard/DriverAvailability";
import { CurrentAssignment } from "@/components/driver-dashboard/CurrentAssignment";
import { DriverTodaySummary } from "@/components/driver-dashboard/DriverTodaySummary";
import { useDriverDashboard } from "@/hooks/useDriverDashboard";

export default function DriverHomePage() {
  const { loading, needsProfile, createProfile } = useDriverDashboard();
  const [saving, setSaving] = useState(false);

  async function handleCreateProfile() {
    setSaving(true);

    try {
      await createProfile({
        vehicle_type: "Motorbike",
        vehicle_number: "",
      });
      toast.success("Driver profile saved");
    } catch (profileError) {
      toast.error(
        profileError instanceof Error
          ? profileError.message
          : "Unable to save your driver profile",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 className="size-4 animate-spin" />
        Loading your dashboard...
      </p>
    );
  }

  if (needsProfile) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-bold">Set up your driver profile</h1>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          A driver profile is required before you can go online or receive
          deliveries. Vehicle details can be updated later from your profile.
        </p>

        <button
          type="button"
          disabled={saving}
          onClick={handleCreateProfile}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          Create driver profile
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm font-semibold text-orange-500">Driver</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Courier dashboard
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Manage your availability and deliveries.
        </p>
      </div>

      <div className="mt-8">
        <DriverAvailability />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <DriverTodaySummary />

        <CurrentAssignment />
      </div>
    </div>
  );
}