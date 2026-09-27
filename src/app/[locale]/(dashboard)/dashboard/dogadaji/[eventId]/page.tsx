import EventProductsPage from "@/features/events/pages/EventProductsPage/EventProductsPage";
export default async function EventPage({ params }: { params: Promise<{ locale: string; eventId: string }> }) {
  const { eventId } = await params;
  return <EventProductsPage eventId={eventId} />;
}
