"use client";

import { useState } from "react";

import type { MenuCategory, MenuItem } from "@/services/menu";

interface MenuItemFormProps {
  categories: MenuCategory[];
  initialItem?: MenuItem;
  loading?: boolean;
  submitError?: string;
  onSubmit: (values: {
    category_id: string;
    name: string;
    description: string;
    price: string;
  }) => Promise<void>;
  onImageChange: (file: File | null) => void;
  imagePreviewUrl: string | null;
}

/**
 * The backend exposes POST .../menu-items and PATCH .../availability only.
 * There is no update endpoint for name, price, description, or category, so
 * those fields are editable in create mode and read-only in edit mode; the
 * image picker is a local preview because no upload endpoint exists yet.
 */
export function MenuItemForm({
  categories,
  initialItem,
  loading = false,
  submitError = "",
  onSubmit,
  onImageChange,
  imagePreviewUrl,
}: MenuItemFormProps) {
  const isEdit = Boolean(initialItem);

  const submitLabel = isEdit ? "Save availability" : "Save item";

  const [categoryId, setCategoryId] = useState(
    initialItem?.category_id ?? categories[0]?.id ?? "",
  );
  const [name, setName] = useState(initialItem?.name ?? "");
  const [description, setDescription] = useState(
    initialItem?.description ?? "",
  );
  const [price, setPrice] = useState(initialItem?.price ?? "");
  const [validationError, setValidationError] = useState("");

  const availableCategories = isEdit
    ? categories
    : categories.filter((category) => category.id === categoryId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");

    if (!name.trim()) {
      setValidationError("Name is required.");
      return;
    }

    if (!categoryId) {
      setValidationError("Select a category.");
      return;
    }

    if (!Number.isFinite(Number.parseFloat(price)) || Number(price) < 0) {
      setValidationError("Enter a valid price.");
      return;
    }

    await onSubmit({
      category_id: categoryId,
      name: name.trim(),
      description: description.trim(),
      price: price.trim(),
    });
  }

  const fieldClass =
    "h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-zinc-50 disabled:text-zinc-500";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6"
    >
      <div>
        <label className="text-sm font-semibold" htmlFor="item-image">
          Image
        </label>

        <div className="mt-2 flex items-center gap-4">
          <div className="flex size-24 items-center justify-center overflow-hidden rounded-xl bg-zinc-100">
            {imagePreviewUrl ? (
              // Preview only: the backend has no upload endpoint, so the
              // selected image is not persisted.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreviewUrl}
                alt="Selected menu item"
                className="size-full object-cover"
              />
            ) : (
              <span className="text-xs text-zinc-400">No image</span>
            )}
          </div>

          <input
            id="item-image"
            type="file"
            accept="image/*"
            onChange={(event) => onImageChange(event.target.files?.[0] ?? null)}
            className="text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-orange-600"
          />
        </div>

        <p className="mt-2 text-xs text-zinc-500">
          Image upload is not available yet: the backend stores items without
          an upload endpoint, so a selected image is previewed only.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="text-sm font-semibold"
            htmlFor="item-category"
          >
            Category
          </label>

          <select
            id="item-category"
            value={categoryId}
            disabled={isEdit}
            onChange={(event) => setCategoryId(event.target.value)}
            className={`mt-2 ${fieldClass}`}
          >
            <option value="">Select a category</option>

            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold" htmlFor="item-price">
            Price
          </label>

          <input
            id="item-price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            disabled={isEdit}
            onChange={(event) => setPrice(event.target.value)}
            className={`mt-2 ${fieldClass}`}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold" htmlFor="item-name">
          Name
        </label>

        <input
          id="item-name"
          value={name}
          disabled={isEdit}
          onChange={(event) => setName(event.target.value)}
          className={`mt-2 ${fieldClass}`}
        />
      </div>

      <div>
        <label
          className="text-sm font-semibold"
          htmlFor="item-description"
        >
          Description
        </label>

        <textarea
          id="item-description"
          value={description}
          disabled={isEdit}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-zinc-50 disabled:text-zinc-500"
        />
      </div>

      {isEdit && (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          Editing name, price, description, and category is not supported by
          the API yet. Only availability can be changed from the menu page.
        </p>
      )}

      {(validationError || submitError) && (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {validationError || submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-xl bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}