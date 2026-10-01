import { ReactNode } from "react";

import { AdminHeader } from "./AdminHeader";
import {
  AdminMobileNav,
  AdminSidebar,
} from "./AdminSidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <AdminHeader />

        <main className="px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>

      <AdminMobileNav />
    </div>
  );
}
