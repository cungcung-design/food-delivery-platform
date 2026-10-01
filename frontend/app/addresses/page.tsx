"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

import {
  createAddress,
  getAddresses,
  type Address,
} from "@/services/cart";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void getAddresses()
        .then((data) => setAddresses(data.addresses ?? []))
        .catch((loadError) => {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load addresses.",
          );
        })
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const label = String(form.get("label") ?? "").trim();
    const addressLine = String(form.get("address_line") ?? "").trim();
    const city = String(form.get("city") ?? "").trim();

    if (!label || !addressLine || !city) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createAddress({
        label,
        address_line: addressLine,
        city,
      });

      const data = await getAddresses();
      setAddresses(data.addresses ?? []);

      event.currentTarget.reset();
      toast.success("Address saved");
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Could not save address.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <CustomerLayout>
      <Container className="py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold text-orange-500">Account</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Delivery addresses
          </h1>

          {error && (
            <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          )}

          {loading ? (
            <p className="mt-8 text-sm text-zinc-500">
              Loading addresses...
            </p>
          ) : addresses.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
              No saved addresses yet.
            </p>
          ) : (
            <div className="mt-8 space-y-3">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5"
                >
                  <p className="font-semibold">{address.label}</p>

                  <p className="mt-1 text-sm text-zinc-500">
                    {address.address_line}, {address.city}
                  </p>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={submit}
            className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
          >
            <h2 className="text-lg font-bold">Add an address</h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Label
                <input
                  name="label"
                  defaultValue="Home"
                  required
                  aria-invalid={Boolean(error)}
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

            <Button
              type="submit"
              disabled={saving}
              className="mt-4 w-full sm:w-auto"
            >
              {saving ? "Saving" : "Save address"}
            </Button>
          </form>
        </div>
      </Container>
    </CustomerLayout>
  );
}
