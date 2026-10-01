"use client";

import { useState } from "react";

import { CartItem } from "./CartItem";
import type { Cart, CartItem as CartItemType } from "@/services/cart";
import { removeCartItem, updateCartItem } from "@/services/cart";

interface CartItemsProps {
  items: CartItemType[];
  onChanged: (cart: Cart) => void;
}

export function CartItems({ items, onChanged }: CartItemsProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function update(id: string, quantity: number) {
    setBusyId(id);
    setError("");

    try {
      const data = await updateCartItem(id, quantity);
      onChanged(data.cart);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update item.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    setError("");

    try {
      const data = await removeCartItem(id);
      onChanged(data.cart);
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Could not remove item.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white px-4 sm:px-6">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            busy={busyId === item.id}
            onQuantityChange={update}
            onRemove={remove}
          />
        ))}
      </div>
    </div>
  );
}
