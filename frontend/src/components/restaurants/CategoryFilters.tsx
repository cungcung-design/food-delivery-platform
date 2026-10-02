"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  BROWSE_CATEGORIES,
  isBrowseCategory,
} from "@/lib/browse-categories";

export function CategoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requested = searchParams.get("category");
  const selected = isBrowseCategory(requested) ? requested : "All";

  function selectCategory(category: string) {
    const next = new URLSearchParams(searchParams.toString());

    if (category === "All") {
      next.delete("category");
    } else {
      next.set("category", category);
    }

    const query = next.toString();
    router.push(query ? `/restaurants?${query}` : "/restaurants");
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {BROWSE_CATEGORIES.map((category) => {
        const active = selected === category;

        return (
          <button
            key={category}
            onClick={() => selectCategory(category)}
            className={`
              shrink-0 rounded-full px-4 py-2
              text-sm font-medium transition
              ${
                active
                  ? "bg-zinc-950 text-white"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
              }
            `}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}