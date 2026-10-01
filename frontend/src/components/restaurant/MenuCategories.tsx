"use client";

interface MenuCategoriesProps {
  categories: { id: string; name: string }[];
  active: string;
  onSelect: (id: string) => void;
}

export function MenuCategories({
  categories,
  active,
  onSelect,
}: MenuCategoriesProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-16 z-30 border-b border-zinc-100 bg-white/95 backdrop-blur">
      <div className="flex gap-2 overflow-x-auto py-4">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={
              active === category.id
                ? "shrink-0 rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white"
                : "shrink-0 rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100"
            }
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
