import { notFound } from "next/navigation";
import TablePrototypeLoader from "@/features/seating/components/prototypes/TablePrototypeLoader";

export default function TablePrototypePage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <TablePrototypeLoader />;
}
