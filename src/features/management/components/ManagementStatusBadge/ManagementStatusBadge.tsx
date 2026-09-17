import styles
  from "./ManagementStatusBadge.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface ManagementStatusBadgeProps {
  isPublished:
    boolean;

  publishedLabel:
    string;

  draftLabel:
    string;
}


/* ==========================================================================
   Management Status Badge
========================================================================== */

export default function ManagementStatusBadge({
  isPublished,
  publishedLabel,
  draftLabel,
}: ManagementStatusBadgeProps) {
  return (
    <span
      className={
        styles.status
      }
      data-published={
        isPublished
          ? "true"
          : "false"
      }
    >
      <span
        className={
          styles.statusDot
        }
        aria-hidden="true"
      />

      {isPublished
        ? publishedLabel
        : draftLabel}
    </span>
  );
}