import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function PromoBanner() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="overflow-hidden rounded-3xl bg-zinc-950 px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
          <div className="max-w-xl">
            <span className="text-sm font-semibold text-orange-400">
              Special offer
            </span>

            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Your next meal is closer than you think.
            </h2>

            <p className="mt-4 text-zinc-300">
              Explore restaurants around you and
              discover something delicious today.
            </p>

            <Button className="mt-7">
              Explore restaurants
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}