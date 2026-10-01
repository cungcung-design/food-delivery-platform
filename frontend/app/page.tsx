import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { FoodCategories } from "@/components/home/FoodCategories";
import { HeroSection } from "@/components/home/HeroSection";
import { PopularRestaurants } from "@/components/home/PopularRestaurants";
import { PromoBanner } from "@/components/home/PromoBanner";

export default function HomePage() {
  return (
    <CustomerLayout>
      <HeroSection />
      <FoodCategories />
      <PopularRestaurants />
      <PromoBanner />
    </CustomerLayout>
  );
}