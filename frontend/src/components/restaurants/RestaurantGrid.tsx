import { RestaurantCard } from "@/components/home/RestaurantCard";

const restaurants = [
  {
    id: "burger-house",
    name: "Burger House",
    category: "Burgers • American",
    rating: 4.8,
    deliveryTime: "20–30 min",
    deliveryFee: "RM 3 delivery",
  },
  {
    id: "tokyo-bowl",
    name: "Tokyo Bowl",
    category: "Japanese • Asian",
    rating: 4.7,
    deliveryTime: "25–35 min",
    deliveryFee: "RM 4 delivery",
  },
  {
    id: "pizza-corner",
    name: "Pizza Corner",
    category: "Pizza • Italian",
    rating: 4.9,
    deliveryTime: "20–25 min",
    deliveryFee: "Free delivery",
  },
  {
    id: "green-kitchen",
    name: "Green Kitchen",
    category: "Healthy • Salads",
    rating: 4.6,
    deliveryTime: "20–30 min",
    deliveryFee: "RM 2 delivery",
  },
  {
    id: "seoul-kitchen",
    name: "Seoul Kitchen",
    category: "Korean • Asian",
    rating: 4.8,
    deliveryTime: "30–40 min",
    deliveryFee: "RM 4 delivery",
  },
  {
    id: "sweet-corner",
    name: "Sweet Corner",
    category: "Desserts • Bakery",
    rating: 4.7,
    deliveryTime: "15–25 min",
    deliveryFee: "RM 3 delivery",
  },
];

export function RestaurantGrid() {
  return (
    <div
      className="
        grid gap-5
        sm:grid-cols-2
        lg:grid-cols-3
      "
    >
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          {...restaurant}
        />
      ))}
    </div>
  );
}