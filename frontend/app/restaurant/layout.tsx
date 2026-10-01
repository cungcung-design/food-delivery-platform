import { ReactNode } from "react";

import { DashboardShell } from "@/components/restaurant-dashboard/DashboardShell";

export default function RestaurantLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}