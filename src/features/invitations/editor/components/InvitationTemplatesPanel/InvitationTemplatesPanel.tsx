import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { invitationTemplates, type InvitationTemplateId, type InvitationTemplate } from "../../../templates/invitationTemplates";
import InvitationThumbnail from "../InvitationThumbnail/InvitationThumbnail";
import { createInvitationTemplateDocument } from "../../../templates/createInvitationTemplateDocument";
import styles from "./InvitationTemplatesPanel.module.css";

interface InvitationTemplatesPanelProps {
  disabled: boolean;
  onPreview: (id: InvitationTemplateId) => void;
}

export default function InvitationTemplatesPanel({ disabled, onPreview }: InvitationTemplatesPanelProps) {
  const t = useTranslations("Invitations.templates");
  const allT = useTranslations("Invitations");
  const previews = useMemo(() => new Map(invitationTemplates.map(template => {
    const document = createInvitationTemplateDocument(template.id, key => allT(key));

    // Stable DOM identifiers for presentation; applying still creates fresh persisted IDs.
    return [template.id, { ...document, pages: document.pages.map((page, index) => ({ ...page, id: `template-${template.id}-${index}` })) }];
  })), [allT]);
  const [category, setCategory] = useState<InvitationTemplate["category"] | "all">("all");
  const categories = [...new Set(invitationTemplates.map(template => template.category))];

  return <div className={styles.panel}>
    <p className={styles.hint}>
      {t("hint")}
    </p>
    <div className={styles.filters} aria-label={t("filter")}>
      {(["all", ...categories] as const).map(item => <Button
        key={item}
        size="sm"
        variant={category === item ? "default" : "outline"}
        aria-pressed={category === item}
        onClick={() => setCategory(item)}>
        {t(`categories.${item}`)}
      </Button>)}
    </div>

    {invitationTemplates.filter(template => category === "all" || template.category === category).map(template => <article className={styles.card} key={template.id}>
      <InvitationThumbnail document={previews.get(template.id)!} large />
      <div className={styles.meta}>
        <h2>
          {t(`names.${template.id}`)}
        </h2>
        <p>
          {t(`categories.${template.category}`)}
          ·
          {t("pageCount", { count: template.pages.length })}
        </p>
      </div>
      <Button variant="outline" disabled={disabled} onClick={() => onPreview(template.id)}>
        {t("preview")}
      </Button>
    </article>)}
  </div>;
}
