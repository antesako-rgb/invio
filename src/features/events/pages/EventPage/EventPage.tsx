import GuestStats
  from "@/features/guests/components/GuestStats/GuestStats";

import type {
  EventGuest,
} from "@/features/guests/types/guest.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventPageProps {
  guests:
    EventGuest[];
}


/* ==========================================================================
   Event Overview Page
========================================================================== */

export default function EventPage({
  guests,
}: EventPageProps) {
  return (
    <div>
      <GuestStats
        guests={
          guests
        }
      />
    </div>
  );
}