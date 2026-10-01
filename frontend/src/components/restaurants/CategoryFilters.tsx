"use client";

import { useState } from "react";

const categories = [
  "All",
  "Burgers",
  "Pizza",
  "Asian",
  "Healthy",
  "Desserts",
  "Drinks",
];

export function CategoryFilters() {
  const [selected, setSelected] = useState("All");

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((category) => {
        const active = selected === category;

        return (
          <button
            key={category}
            onClick={() => setSelected(category)}
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