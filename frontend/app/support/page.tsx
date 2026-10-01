import { redirect } from "next/navigation";

interface SupportPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function SupportPage({
  searchParams,
}: SupportPageProps) {
  const { order } = await searchParams;

  redirect(order ? `/assistant?order=${order}` : "/assistant");
}
