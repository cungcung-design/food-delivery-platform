import {
  CircleCheck,
  LoaderCircle,
  WifiOff,
} from "lucide-react";

import type { ConnectionState } from "@/hooks/useDeliveryTracking";

const COPY: Record<
  ConnectionState,
  { label: string; className: string }
> = {
  connecting: {
    label: "Connecting",
    className: "text-amber-700",
  },
  live: {
    label: "Live",
    className: "text-green-700",
  },
  reconnecting: {
    label: "Reconnecting",
    className: "text-amber-700",
  },
  offline: {
    label: "Offline",
    className: "text-red-600",
  },
};

interface ConnectionStatusProps {
  state: ConnectionState;
}

export function ConnectionStatus({ state }: ConnectionStatusProps) {
  const copy = COPY[state];
  const spinning = state === "connecting" || state === "reconnecting";

  return (
    <div
      className={`flex items-center gap-2 text-xs font-medium ${copy.className}`}
    >
      {spinning && <LoaderCircle className="size-4 animate-spin" />}

      {state === "live" && <CircleCheck className="size-4" />}

      {state === "offline" && <WifiOff className="size-4" />}

      {copy.label}
    </div>
  );
}
