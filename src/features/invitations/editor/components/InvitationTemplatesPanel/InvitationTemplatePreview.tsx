import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog";
import InvitationRenderer from "../../../components/invitation-renderer/InvitationRenderer";
import type { InvitationDocument } from "../../../types/invitationDocument.types";
import type { InvitationTemplateId } from "../../../templates/invitationTemplates";
import styles from "./InvitationTemplatesPanel.module.css";

export type InvitationTemplateSelection = { id: InvitationTemplateId; document: InvitationDocument };

interface InvitationTemplatePreviewProps {
  selection: InvitationTemplateSelection | null;
  replacing: boolean;
  disabled: boolean;
  onClose: () => void;
  onApply: () => void;
}

export default function InvitationTemplatePreview({ selection, replacing, disabled, onClose, onApply }: InvitationTemplatePreviewProps) {
  const t = useTranslations("Invitations");
  const locale = useLocale();

  return <Dialog open={Boolean(selection)} onOpenChange={open => {
    if (!open) onClose();
  }}>
    <DialogContent className={styles.dialog}>
      <DialogHeader>
        <DialogTitle>
          {selection ? t(`templates.names.${selection.id}`) : t("editor.templates")}
        </DialogTitle>
        <DialogDescription>
          {t(replacing ? "templates.replaceHint" : "templates.applyHint")}
        </DialogDescription>
      </DialogHeader>

      {selection && <div className={styles.preview}>
        <InvitationRenderer document={selection.document} photos={[]} locale={locale} />
      </div>}
      <div className={styles.actions}>
        <Button variant="outline" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button disabled={disabled} onClick={onApply}>
          {t(replacing ? "templates.replace" : "templates.apply")}
        </Button>
      </div>
    </DialogContent>
  </Dialog>;
}
