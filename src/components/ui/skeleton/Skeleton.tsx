import {
  cn,
} from "@/lib/utils/utils";


/* ==========================================================================
   Types
========================================================================== */

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {}


/* ==========================================================================
   Skeleton
========================================================================== */

export function Skeleton({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        `
          animate-pulse
          rounded-md
          bg-muted
          block
        `,
        className
      )}
      {...props}
    />
  );
}