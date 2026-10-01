import Link from "next/link";
import {
  Clock3,
  Heart,
  Star,
} from "lucide-react";

interface RestaurantCardProps {
  id: string;
  name: string;
  category: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
}

export function RestaurantCard({
  id,
  name,
  category,
  rating,
  deliveryTime,
  deliveryFee,
}: RestaurantCardProps) {
  return (
    <Link href={`/restaurants/${id}`}>
      <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-[16/10] bg-zinc-100">
          <button
            className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-white/95 shadow-sm"
            aria-label={`Save ${name}`}
          >
            <Heart className="size-5" />
          </button>

          <span className="absolute bottom-3 left-3 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold shadow-sm">
            {deliveryFee}
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-zinc-950">
                {name}
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                {category}
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-sm font-semibold text-green-700">
              <Star className="size-3.5 fill-current" />
              {rating}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
            <Clock3 className="size-4" />
            {deliveryTime}
          </div>
        </div>
      </article>
    </Link>
  );
}