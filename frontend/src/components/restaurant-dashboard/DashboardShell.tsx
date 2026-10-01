"use client";

import { ReactNode, useState } from "react";

import {
  OwnerRestaurantProvider,
  useOwnerRestaurant,
} from "@/hooks/useOwnerRestaurant";
import { RestaurantHeader } from "./RestaurantHeader";
import { RestaurantMobileNav } from "./RestaurantMobileNav";
import { RestaurantSidebar } from "./RestaurantSidebar";

function Shell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { restaurant } = useOwnerRestaurant();

  return (
    <div className="min-h-dvh bg-zinc-50">
      <RestaurantSidebar restaurantName={restaurant?.name} />

      <RestaurantMobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="lg:pl-64">
        <RestaurantHeader
          restaurant={restaurant}
          onMenuOpen={() => setMobileNavOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <OwnerRestaurantProvider>
      <Shell>{children}</Shell>
    </OwnerRestaurantProvider>
  );
}