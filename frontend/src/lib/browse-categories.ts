export const BROWSE_CATEGORIES = [
  "All",
  "Burgers",
  "Pizza",
  "Asian",
  "Healthy",
  "Desserts",
  "Drinks",
] as const;

export type BrowseCategory = (typeof BROWSE_CATEGORIES)[number];

const RESTAURANTS_BY_CATEGORY: Record<Exclude<BrowseCategory, "All">, string[]> = {
  Burgers: ["Burger House"],
  Pizza: ["Pizza Corner"],
  Asian: ["Village Nasi Lemak", "Tokyo Bowl", "Seoul Kitchen"],
  Healthy: ["Green Kitchen"],
  Desserts: ["Sweet Corner"],
  Drinks: ["Green Kitchen", "Sweet Corner"],
};

export function isBrowseCategory(value: string | null): value is BrowseCategory {
  return BROWSE_CATEGORIES.some((category) => category === value);
}

export function restaurantMatchesCategory(
  name: string,
  category: string | null,
): boolean {
  if (!isBrowseCategory(category) || category === "All") {
    return true;
  }

  return RESTAURANTS_BY_CATEGORY[category].includes(name);
}
