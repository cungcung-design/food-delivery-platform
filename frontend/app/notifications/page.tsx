import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Container } from "@/components/ui/Container";
import { NotificationList } from "@/components/notifications/NotificationList";

export default function NotificationsPage() {
  return (
    <CustomerLayout>
      <Container className="py-8 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <div>
            <p className="text-sm font-semibold text-orange-500">Updates</p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 text-zinc-500">
              Stay updated on your orders and deliveries.
            </p>
          </div>

          <div className="mt-8">
            <NotificationList />
          </div>
        </div>
      </Container>
    </CustomerLayout>
  );
}
