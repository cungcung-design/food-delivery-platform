"use client";

import { useEffect, useState } from "react";

import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Container } from "@/components/ui/Container";
import { CartItems } from "@/components/cart/CartItems";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";

import { clearCart, getCart, type Cart } from "@/services/cart";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCart()
      .then((data) => setCart(data.cart))
      .catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load cart.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  async function emptyCart() {
    setClearing(true);
    setError("");

    try {
      const data = await clearCart();
      setCart(data.cart);
    } catch (clearError) {
      setError(
        clearError instanceof Error
          ? clearError.message
          : "Could not clear cart.",
      );
    } finally {
      setClearing(false);
    }
  }

  const items = cart?.items ?? [];

  return (
    <CustomerLayout>
      <Container className="py-8 sm:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-orange-500">
              Your basket
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              Cart
            </h1>

            {cart?.restaurant_name && (
              <p className="mt-2 text-zinc-500">
                {cart.restaurant_name}
              </p>
            )}
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={emptyCart}
              disabled={clearing}
              className="text-sm font-semibold text-zinc-500 transition hover:text-red-600 disabled:opacity-50"
            >
              {clearing ? "Clearing" : "Clear cart"}
            </button>
          )}
        </div>

        {error && (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-12 text-sm text-zinc-500">Loading cart...</p>
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
            <CartItems
              items={items}
              onChanged={(next) => setCart(next)}
            />

            <CartSummary
              subtotal={cart?.subtotal ?? "0"}
              deliveryFee={cart?.delivery_fee ?? "0"}
              discount={cart?.discount ?? "0"}
              total={cart?.total ?? "0"}
            />
          </div>
        )}
      </Container>
    </CustomerLayout>
  );
}
