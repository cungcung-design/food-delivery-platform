"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { MenuItemForm } from "@/components/restaurant-menu/MenuItemForm";
import { useOwnerMenu } from "@/hooks/useOwnerMenu";
import { useOwnerRestaurant } from "@/hooks/useOwnerRestaurant";
import { createCategory, createMenuItem } from "@/services/menu";

export default function NewMenuItemPage() {
  const { restaurant } = useOwnerRestaurant();
  const { categories, loading, reload } = useOwnerMenu();

  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Object URLs are revoked so previews do not leak when a new file is
  // chosen or the page unmounts.
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  function handleImageChange(file: File | null) {
    setImagePreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function handleCreateCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!restaurant) {
      return;
    }

    setCreatingCategory(true);
    setCategoryError("");

    try {
      await createCategory(restaurant.id, categoryName);
      setCategoryName("");
      await reload();
    } catch (createCategoryError) {
      setCategoryError(
        createCategoryError instanceof Error
          ? createCategoryError.message
          : "Could not create category.",
      );
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleSubmit(values: {
    category_id: string;
    name: string;
    description: string;
    price: string;
  }) {
    if (!restaurant) {
      setSubmitError("No restaurant is linked to this account.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await createMenuItem(restaurant.id, {
        category_id: values.category_id,
        name: values.name,
        description: values.description || undefined,
        price: values.price,
      });

      toast.success("Menu item added");
      router.push("/restaurant/menu");
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Could not create menu item.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!restaurant) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-500">
          No restaurant is linked to this account, so menu items cannot be
          added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <p className="text-sm font-semibold text-orange-500">Menu</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Add menu item
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Create a new item for {restaurant.name}.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <MenuItemForm
          categories={categories}
          loading={loading || submitting}
          submitError={submitError}
          onSubmit={handleSubmit}
          onImageChange={handleImageChange}
          imagePreviewUrl={imagePreviewUrl}
        />

        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="font-bold">Add a category</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Items must belong to a category.
          </p>

          <form
            onSubmit={handleCreateCategory}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="e.g. Desserts"
              className="h-11 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />

            <button
              type="submit"
              disabled={creatingCategory}
              className="h-11 rounded-xl border border-zinc-200 px-4 text-sm font-semibold transition hover:bg-zinc-50 disabled:opacity-60"
            >
              {creatingCategory ? "Adding..." : "Add category"}
            </button>
          </form>

          {categoryError && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {categoryError}
            </p>
          )}
        </section>

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