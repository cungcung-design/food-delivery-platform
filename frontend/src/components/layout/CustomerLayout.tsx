import { CustomerHeader } from "./CustomerHeader";
import { MobileNavigation } from "./MobileNavigation";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export function CustomerLayout({
  children,
}: CustomerLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <CustomerHeader />

      <main className="pb-20 md:pb-0">
        {children}
      </main>

      <MobileNavigation />
    </div>
  );
}