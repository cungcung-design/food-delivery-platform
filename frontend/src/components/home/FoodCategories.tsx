import { Container } from "@/components/ui/Container";

const categories = [
  { name: "Burgers", icon: "🍔" },
  { name: "Pizza", icon: "🍕" },
  { name: "Asian", icon: "🍜" },
  { name: "Healthy", icon: "🥗" },
  { name: "Desserts", icon: "🍰" },
  { name: "Drinks", icon: "🥤" },
];

export function FoodCategories() {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-500">
              Categories
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              What are you craving?
            </h2>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 md:grid-cols-6 sm:overflow-visible">
          {categories.map((category) => (
            <button
              key={category.name}
              className="group flex min-w-28 flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-md sm:min-w-0"
            >
              <span className="text-3xl transition group-hover:scale-110">
                {category.icon}
              </span>

              <span className="text-sm font-semibold">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}