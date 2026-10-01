"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  acceptDelivery,
  advanceDelivery,
  getDeliveries,
  getDriver,
  saveDriverProfile,
  setDriverLocation,
  setDriverStatus,
  type DeliveryJob,
  type DriverProfile,
} from "@/services/driver";

/** Statuses the driver may pick for themselves. BUSY is backend-owned. */
export type DriverStatus = "OFFLINE" | "AVAILABLE" | "PAUSED";

export type AdvanceTarget = "PICKED_UP" | "OUT_FOR_DELIVERY" | "DELIVERED";

const ACTIVE_DELIVERY_STATUSES = [
  "ASSIGNED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
];

interface DriverDashboardContextValue {
  driver: DriverProfile | undefined;
  /** The delivery this driver currently owns, if any. */
  activeDelivery: DeliveryJob | undefined;
  /** Unassigned READY deliveries offered when the driver is AVAILABLE. */
  openDeliveries: DeliveryJob[];
  loading: boolean;
  error: string;
  needsProfile: boolean;
  reload: () => Promise<void>;
  changeStatus: (status: DriverStatus) => Promise<void>;
  createProfile: (input: {
    vehicle_type: string;
    vehicle_number: string;
  }) => Promise<void>;
  accept: (deliveryId: string) => Promise<void>;
  advance: (deliveryId: string, next: AdvanceTarget) => Promise<void>;
  shareLocation: (latitude: number, longitude: number) => Promise<void>;
}

const DriverDashboardContext =
  createContext<DriverDashboardContextValue | null>(null);

/**
 * `/api/driver/deliveries` returns the driver's own active delivery when one
 * exists, and otherwise the dispatchable queue. Splitting them here keeps
 * "my delivery" and "available work" as separate concepts in the UI.
 */
export function DriverDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [driver, setDriver] = useState<DriverProfile | undefined>(undefined);
  const [deliveries, setDeliveries] = useState<DeliveryJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [profileResult, deliveryResult] = await Promise.allSettled([
      getDriver(),
      getDeliveries(),
    ]);

    if (profileResult.status === "fulfilled") {
      setDriver(profileResult.value.driver);
    } else {
      setDriver(undefined);
    }

    if (deliveryResult.status === "fulfilled") {
      setDeliveries(deliveryResult.value.deliveries ?? []);
    } else {
      setError(
        deliveryResult.reason instanceof Error
          ? deliveryResult.reason.message
          : "Could not load deliveries.",
      );
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load().finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const runAction = useCallback(
    async (action: () => Promise<unknown>, failure: string) => {
      setError("");

      try {
        await action();
        await load();
      } catch (actionError) {
        setError(
          actionError instanceof Error ? actionError.message : failure,
        );
        throw actionError;
      }
    },
    [load],
  );

  const value = useMemo<DriverDashboardContextValue>(() => {
    const activeDelivery = deliveries.find((item) =>
      ACTIVE_DELIVERY_STATUSES.includes(item.status),
    );

    return {
      driver,
      activeDelivery,
      openDeliveries: deliveries.filter(
        (item) => item.status === "UNASSIGNED",
      ),
      loading,
      error,
      needsProfile: !loading && driver === undefined,
      reload: load,
      changeStatus: async (status) => {
        await runAction(
          () => setDriverStatus(status),
          "Could not update your status.",
        );
      },
      createProfile: async (input) => {
        await runAction(
          () => saveDriverProfile(input),
          "Could not save your driver profile.",
        );
      },
      accept: async (deliveryId) => {
        await runAction(
          () => acceptDelivery(deliveryId),
          "Could not accept the delivery.",
        );
      },
      advance: async (deliveryId, next) => {
        await runAction(
          () => advanceDelivery(deliveryId, next),
          "Could not update the delivery.",
        );
      },
      shareLocation: async (latitude, longitude) => {
        await setDriverLocation(latitude, longitude);
      },
    };
  }, [driver, deliveries, loading, error, load, runAction]);

  return (
    <DriverDashboardContext.Provider value={value}>
      {children}
    </DriverDashboardContext.Provider>
  );
}

export function useDriverDashboard(): DriverDashboardContextValue {
  const context = useContext(DriverDashboardContext);

  if (!context) {
    throw new Error(
      "useDriverDashboard must be used inside DriverDashboardProvider",
    );
  }

  return context;
}