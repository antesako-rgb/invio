import EventExperienceCard
  from "@/features/invitations/components/event-experiences/EventExperienceCard/EventExperienceCard";

import type {
  EventExperience,
} from "@/features/invitations/types/eventExperience.types";

import styles
  from "./EventExperiencesList.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperiencesListProps {
  experiences:
    EventExperience[];
}


/* ==========================================================================
   Event Experiences List
========================================================================== */

export default function EventExperiencesList({
  experiences,
}: EventExperiencesListProps) {
  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.root
      }
    >
      {experiences.map(
        (experience) => (
          <EventExperienceCard
            key={
              experience.id
            }
            experience={
              experience
            }
          />
        )
      )}
    </div>
  );
}