"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Container } from "@/components/ui/Container";

import { CheckoutItems } from "@/components/checkout/CheckoutItems";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { DeliveryAddress } from "@/components/checkout/DeliveryAddress";
import { PaymentMethod } from "@/components/checkout/PaymentMethod";
import { EmptyCart } from "@/components/cart/EmptyCart";

import {
  Address,
  Cart,
  createAddress,
  getAddresses,
  getCart,
} from "@/services/cart";
import { checkout } from "@/services/orders";

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const [cartData, addressData] = await Promise.all([
      getCart(),
      getAddresses(),
    ]);

    setCart(cartData.cart);
    setAddresses(addressData.addresses ?? []);
    setSelectedId((current) => {
      const available = addressData.addresses ?? [];

      if (current && available.some((item) => item.id === current)) {
        return current;
      }

      return available[0]?.id ?? "";
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
        .catch((loadError) => {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load checkout.",
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const label = String(form.get("label") ?? "").trim();
    const line = String(form.get("address_line") ?? "").trim();
    const city = String(form.get("city") ?? "").trim();

    if (!label || !line || !city) {
      return;
    }

    setError("");

    try {
      const created = await createAddress({
        label,
        address_line: line,
        city,
      });

      setShowForm(false);
      await load();
      setSelectedId(created.address.id);
      toast.success("Address saved");
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Could not save address.";
      setError(message);
      toast.error(message);
    }
  }

  async function placeOrder() {
    if (!selectedId) {
      setError("Select a delivery address to continue.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const data = await checkout(selectedId);
      toast.success("Order placed");
      router.push(`/orders/${data.order.id}`);
    } catch (placeError) {
      const message =
        placeError instanceof Error
          ? placeError.message
          : "Could not place order.";
      setError(message);
      toast.error(message);
      setSubmitting(false);
      await load().catch(() => undefined);
    }
  }

  if (loading) {
    return (
      <CustomerLayout>
        <Container className="py-20 text-center text-sm text-zinc-500">
          Loading checkout...
        </Container>
      </CustomerLayout>
    );
  }

  const items = cart?.items ?? [];
  const hasUnavailable = items.some((item) => !item.is_available);
  const canPlace = Boolean(selectedId) && items.length > 0 && !hasUnavailable;

  return (
    <CustomerLayout>
      <Container className="py-8 sm:py-12">
        <div>
          <p className="text-sm font-semibold text-orange-500">Almost there</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Checkout
          </h1>
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-5">
              <DeliveryAddress
                addresses={addresses}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onAdd={() => setShowForm((value) => !value)}
                adding={false}
              />

              {showForm && (
                <form
                  onSubmit={saveAddress}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
                >
                  <h2 className="text-lg font-bold">New address</h2>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm font-semibold">
                      Label
                      <input
                        name="label"
                        defaultValue="Home"
                        required
                        className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm font-normal outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </label>

                    <label className="block text-sm font-semibold">
                      City
                      <input
                        name="city"
                        defaultValue="Kuala Lumpur"
                        required
                        className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm font-normal outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </label>
                  </div>

                  <label className="mt-3 block text-sm font-semibold">
                    Address line
                    <input
                      name="address_line"
                      required
                      className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm font-normal outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                  </label>

                  <button
                    type="submit"
                    className="mt-4 h-11 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600"
                  >
                    Save address
                  </button>
                </form>
              )}

              <PaymentMethod />

              <CheckoutItems
                items={items}
                restaurantName={cart?.restaurant_name}
              />
            </div>

            <CheckoutSummary
              subtotal={cart?.subtotal ?? "0"}
              deliveryFee={cart?.delivery_fee ?? "0"}
              discount={cart?.discount ?? "0"}
              total={cart?.total ?? "0"}
              submitting={submitting}
              disabled={!canPlace}
              error={error}
              onPlaceOrder={placeOrder}
            />
          </div>
        )}

        {error && items.length === 0 && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}

        {items.length === 0 && (
          <p className="mt-4 text-center text-sm">
            <Link
              href="/restaurants"
              className="font-semibold text-orange-600"
            >
              Browse restaurants
            </Link>
          </p>
        )}
      </Container>
    </CustomerLayout>
  );
}
