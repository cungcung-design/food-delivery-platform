import { MapPin } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="overflow-hidden bg-orange-50">
      <Container>
        <div className="grid min-h-[500px] items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
          <div className="max-w-xl">
            <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              Fast delivery. Great food.
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              Your favorite food,
              <span className="text-orange-500">
                {" "}delivered.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-zinc-600 sm:text-lg">
              Discover restaurants near you and get
              the food you love delivered straight
              to your door.
            </p>

            <div className="mt-8 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-zinc-200">
              <div className="flex items-center gap-3">
                <MapPin className="ml-3 size-5 shrink-0 text-orange-500" />

                <input
                  type="text"
                  defaultValue="18 Jalan Bukit Bintang, Kuala Lumpur"
                  placeholder="Enter your delivery address"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none sm:text-base"
                />

                <Button className="hidden sm:inline-flex">
                  Find Food
                </Button>
              </div>

              <Button className="mt-2 w-full sm:hidden">
                Find Food
              </Button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-orange-100">
              {/* Photos are stored as external URLs, so the browser loads them directly. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80"
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            </div>

            <div className="absolute bottom-8 left-0 rounded-2xl bg-white p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-orange-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80"
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Pizza Corner
                  </p>

                  <p className="text-xs text-zinc-500">
                    Margherita · RM 24.00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
