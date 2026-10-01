interface LocationSharingStatusProps {
  connected: boolean;
  sharing: boolean;
  lastSharedAt?: string | null;
}

export function LocationSharingStatus({
  connected,
  sharing,
  lastSharedAt,
}: LocationSharingStatusProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
          connected
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-700"
        }`}
      >
        <span
          className={`size-2 rounded-full ${
            connected ? "bg-green-500" : "bg-red-500"
          }`}
        />

        {connected ? "Connected" : "Disconnected"}
      </span>

      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
          sharing
            ? "bg-blue-50 text-blue-700"
            : "bg-zinc-100 text-zinc-600"
        }`}
      >
        {sharing ? "Sharing location" : "Location off"}
      </span>

      {lastSharedAt && (
        <span className="text-xs text-zinc-500">
          Updated{" "}
        {new Date(lastSharedAt).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}