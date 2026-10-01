"use client";

import { Check, MapPin, Plus } from "lucide-react";

import type { Address } from "@/services/cart";

interface DeliveryAddressProps {
  addresses: Address[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  adding: boolean;
}

export function DeliveryAddress({
  addresses,
  selectedId,
  onSelect,
  onAdd,
  adding,
}: DeliveryAddressProps) {
  if (addresses.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold">Delivery address</h2>

        <p className="mt-1 text-sm text-zinc-500">
          Add an address before placing your order.
        </p>

        <button
          type="button"
          onClick={onAdd}
          disabled={adding}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-orange-200 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 disabled:opacity-50"
        >
          <Plus className="size-4" />
          Add delivery address
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Delivery address</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Choose where you want your order delivered.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={adding}
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-orange-600 disabled:opacity-50"
        >
          <Plus className="size-4" />
          Add
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {addresses.map((item) => {
          const active = selectedId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              aria-pressed={active}
              className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition ${
                active
                  ? "border-orange-500 bg-orange-50"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white">
                <MapPin className="size-5 text-orange-500" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.label}</p>

                <p className="mt-1 text-sm leading-5 text-zinc-500">
                  {item.address_line}, {item.city}
                </p>
              </div>

              {active && (
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                  <Check className="size-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
