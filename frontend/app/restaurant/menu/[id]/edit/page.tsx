"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { MenuItemForm } from "@/components/restaurant-menu/MenuItemForm";
import { useOwnerMenu } from "@/hooks/useOwnerMenu";
import { setItemAvailability } from "@/services/menu";

export default function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { items, categories, loading, reload } = useOwnerMenu();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const item = items.find((candidate) => candidate.id === id);

  // Availability is the only field the API can change on an existing item.
  async function handleToggleAvailability() {
    if (!item) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await setItemAvailability(item.id, !item.is_available);
      await reload();
      toast.success("Menu item updated");
      router.push("/restaurant/menu");
    } catch (toggleError) {
      const message =
        toggleError instanceof Error
          ? toggleError.message
          : "Could not update availability.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading item...</p>;
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-bold">Item not found</h1>

        <p className="mt-2 text-sm text-zinc-500">
          This item is not part of your restaurant menu.
        </p>

        <Link
          href="/restaurant/menu"
          className="mt-5 inline-flex text-sm font-semibold text-orange-600"
        >
          Back to menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <p className="text-sm font-semibold text-orange-500">Menu</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {item.name}
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Currently {item.is_available ? "available" : "unavailable"}.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <MenuItemForm
          categories={categories}
          initialItem={item}
          loading={submitting}
          submitError={submitError}
          onSubmit={handleToggleAvailability}
          onImageChange={() => undefined}
          imagePreviewUrl={null}
        />

        <Link
          href="/restaurant/menu"
          className="inline-flex text-sm font-semibold text-zinc-500 hover:text-zinc-900"
        >
          Back to menu
        </Link>
      </div>
    </div>
  );
}