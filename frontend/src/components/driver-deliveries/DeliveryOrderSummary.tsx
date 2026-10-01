interface DeliveryOrderSummaryProps {
  items: {
    id: string;
    name: string;
    quantity: number;
  }[];
}

export function DeliveryOrderSummary({ items }: DeliveryOrderSummaryProps) {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Order items</h2>

        <span className="text-sm text-zinc-500">{totalItems} items</span>
      </div>

      <div className="mt-5 divide-y divide-zinc-100">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold">
              {item.quantity}×
            </span>

            <p className="text-sm font-medium">{item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}