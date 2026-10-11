import { notFound } from "next/navigation";
import DjBoothPrototypeLoader from "@/features/seating/components/elements/DjBoothPrototypeLoader";

export default function DjBoothPrototypePage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DjBoothPrototypeLoader />;
}
