"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Armchair } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state/EmptyState";
import type { getSeatingPlans } from "../repositories/getSeatingPlans";
import CreateSeatingPlanDialog from "./CreateSeatingPlanDialog";
import styles from "./SeatingWorkspace.module.css";
export default function SeatingPlans({ projectId, plans, templates }: {
  projectId: string; plans: Awaited<ReturnType<typeof getSeatingPlans>>; templates: { id: string; name: string }[];
}) {
  const t = useTranslations("Seating");
  const [creating, setCreating] = useState(false);
  const add = <Button onClick={() => setCreating(true)}><Plus aria-hidden="true" />{t("createPlan")}</Button>;
  return <div className={styles.workspace}>
    <div className={styles.listHeader}><div><h2>{t("title")}</h2><p className={styles.help}>{t("plansHelp")}</p></div>{add}</div>
    {!plans.length ? <EmptyState variant="card" icon={Armchair} title={t("emptyPlans")} description={t("plansHelp")} action={add} /> :
      <div className={styles.cards}>{plans.map(plan => <Card key={plan.id} className={styles.card}>
        <h3>{plan.name}</h3><p className={styles.help}>{t("planCounts", { tables: plan.tableCount, guests: plan.participantCount })}</p>
        <ButtonLink href={"/dashboard/projects/" + projectId + "/seating/" + plan.id} variant="secondary">{t("openPlan")}</ButtonLink>
      </Card>)}</div>}
    <CreateSeatingPlanDialog key={creating ? "open" : "closed"} projectId={projectId} templates={templates} open={creating} onClose={() => setCreating(false)} />
  </div>;
}
