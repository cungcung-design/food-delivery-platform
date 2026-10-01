import { Bell } from "lucide-react";

export function EmptyNotifications() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-orange-50">
        <Bell className="size-8 text-orange-500" />
      </div>

      <h2 className="mt-6 text-2xl font-bold">No notifications</h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
        Updates about your orders and deliveries will appear here.
      </p>
    </div>
  );
}
