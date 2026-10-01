import { ReactNode } from "react";

import { DriverShell } from "@/components/driver-dashboard/DriverShell";

export default function DriverLayout({ children }: { children: ReactNode }) {
  return <DriverShell>{children}</DriverShell>;
}