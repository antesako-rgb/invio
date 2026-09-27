import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import BackLink from "@/components/ui/back-link/BackLink";
import { getEvent } from "@/features/events/repositories/getEvent";

export default async function EventProductContext({ eventId }: { eventId: string }) {
  const [event, t] = await Promise.all([getEvent(eventId), getTranslations("Events.products")]);
  if (!event) notFound();
  return <>
    <BackLink href={`/dashboard/dogadaji/${eventId}`} label={t("backToEvent", { name: event.name })} />
  </>;
}
