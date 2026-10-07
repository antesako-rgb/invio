"use client";
import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { getInvitationPageType, invitationPageTypes, isInvitationPageType } from "../../../config/invitationPageTypes";
import { getInvitationPageDesigns, resolveInvitationPageDesign } from "../../../config/invitationPageDesigns";
import type { InvitationTheme } from "../../../config/invitationThemes";
import { changeInvitationPageLayout, changeInvitationPageDesign } from "../../../utils/invitationDocumentOperations";
import type { InvitationDocumentPage } from "../../../types/invitationDocument.types";
import styles from "./InvitationContentPanel.module.css";

interface InvitationContentPanelProps {
  mode?: "design" | "type";
  page: InvitationDocumentPage;
  theme: InvitationTheme;
  disabled: boolean;
  onChange: (update: (page: InvitationDocumentPage) => InvitationDocumentPage) => void;
  rsvpExists?: boolean;
}

export default function InvitationContentPanel({ page, theme, disabled, onChange, mode = "design", rsvpExists = false }: InvitationContentPanelProps) {
  const fieldId = useId();
  const t = useTranslations("Invitations");
  const designs = getInvitationPageDesigns(page.type, theme);
  const selectedDesign = resolveInvitationPageDesign(page, theme);

  function changeDesign(designId: string) {
    onChange(current => changeInvitationPageDesign(current, designId, theme));
  }

  function changeType(type: string) {
    if (!isInvitationPageType(type) || (type === "rsvp" && page.type !== "rsvp" && rsvpExists)) return;
    const layouts = getInvitationPageType(type).layouts;

    onChange(current => changeInvitationPageLayout(
      current,
      layouts.includes(current.layout) ? current.layout : layouts[0],
      type,
    ));
  }

  return <fieldset disabled={disabled} className={styles.panel}>
    <legend>
      {t(`types.${page.type}`)}
    </legend>

    <div className={styles.sectionBody}>
    {!!page.unplacedPhotos?.length && <p className={styles.hint}>
      {t("editor.retained", { count: page.unplacedPhotos.length })}
    </p>}
    {mode === "design" && <div className={styles.field}>
      <Label htmlFor={`${fieldId}-layout`}>
        {t("editor.pageDesign")}
      </Label>
      <Select
        id={`${fieldId}-layout`}
        value={selectedDesign.id}
        onValueChange={changeDesign}
        options={designs.map(design => ({ value: design.id, label: t(design.label) }))} />
    </div>}
    {mode === "type" && <div>
      <div className={styles.field}>
        <Label htmlFor={`${fieldId}-type`}>
          {t("editor.pageType")}
        </Label>
        <Select
          id={`${fieldId}-type`}
          value={page.type}
          onValueChange={changeType}
          options={Object.keys(invitationPageTypes).filter(type => type !== "rsvp" || page.type === "rsvp" || !rsvpExists).map(type => ({ value: type, label: t(`types.${type}`) }))} />
      </div>
    </div>}
    </div>
  </fieldset>;
}
