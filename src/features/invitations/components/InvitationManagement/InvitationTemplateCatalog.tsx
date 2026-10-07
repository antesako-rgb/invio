"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import TabsFilter from "@/components/ui/filter/TabsFilter";
import { Card } from "@/components/ui/card";
import { PROJECT_EVENT_TYPES, isProjectEventType, type ProjectEventType } from "@/features/projects/types/projectEvent.types";
import type { InvitationTemplate } from "../../types/invitationTemplate.types";
import { filterInvitationTemplates, type InvitationTemplateFilter } from "../../utils/invitationTemplateFilter";
import InvitationThumbnail from "../../editor/components/InvitationThumbnail/InvitationThumbnail";
import CreateInvitationButton from "../InvitationProjectCard/CreateInvitationButton";
import styles from "./InvitationManagement.module.css";
export default function InvitationTemplateCatalog({ projectId, projectType, isOwner, templates }: {
  projectId: string; projectType: ProjectEventType | null; isOwner: boolean; templates: InvitationTemplate[];
}) {
  const t = useTranslations("Invitations.management");
  const types = useTranslations("Projects.eventDetails.types");
  const [filter, setFilter] = useState<InvitationTemplateFilter>(projectType ?? "all");
  const visible = filterInvitationTemplates(templates, filter);
  return <div className={styles.list}>
    <p className={styles.hint}>{t("templatesHint")}</p>
    <TabsFilter value={filter} onValueChange={value => { if (value === "all" || isProjectEventType(value)) setFilter(value); }}
      items={[{ value: "all", label: t("allTemplates") }, ...PROJECT_EVENT_TYPES.map(type => ({ value: type, label: types(type) }))]} />
    {!isOwner && <p className={styles.hint}>{t("ownerCreates")}</p>}
    {visible.length === 0 && <Card className={styles.card}><p>{t("noTemplates")}</p></Card>}
    <div className={styles.templates}>{visible.map(template => {
      return <Card key={template.id} className={styles.card}>
        <InvitationThumbnail document={template.document} large />
        <h2>{template.name}</h2>
        <p className={styles.hint}>{template.event_type === null ? t("universal") : types(template.event_type)}</p>
        <CreateInvitationButton projectId={projectId} templateId={template.id} disabled={!isOwner} />
      </Card>;
    })}</div>
  </div>;
}
