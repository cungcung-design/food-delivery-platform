"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useParams } from "next/navigation";

import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Container } from "@/components/ui/Container";

import { ConnectionStatus } from "@/components/tracking/ConnectionStatus";
import { DriverCard } from "@/components/tracking/DriverCard";
import { TrackingMap } from "@/components/tracking/TrackingMap";
import { TrackingStatus } from "@/components/tracking/TrackingStatus";

import { getTracking } from "@/services/orders";
import { useDeliveryTracking } from "@/hooks/useDeliveryTracking";
import { useEffect, useState } from "react";

export default function TrackingPage() {
  const params = useParams<{ id: string }>();
  const { tracking, connectionState, lastUpdatedAt } =
    useDeliveryTracking(params.id);

  const [initial, setInitial] = useState<typeof tracking>(null);

  useEffect(() => {
    if (!params.id) {
      return;
    }

    getTracking(params.id)
      .then((data) => setInitial(data.tracking))
      .catch(() => undefined);
  }, [params.id]);

  const current = tracking ?? initial;

  return (
    <CustomerLayout>
      <Container className="py-6 sm:py-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/orders/${params.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
          >
            <ChevronLeft className="size-4" />
            Order details
          </Link>

          <ConnectionStatus state={connectionState} />
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold text-orange-500">
            Live delivery
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Track your order
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Order #{params.id?.slice(0, 8)}
          </p>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <TrackingMap
            tracking={current}
            lastUpdatedAt={lastUpdatedAt}
          />

          <div className="space-y-5">
            <TrackingStatus tracking={current} />

            <DriverCard tracking={current} />
          </div>
        </div>
      </Container>
    </CustomerLayout>
  );
}
