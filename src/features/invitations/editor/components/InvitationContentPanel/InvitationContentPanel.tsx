"use client";
import { useId } from "react";
import { format, isValid, parseISO, startOfDay } from "date-fns";
import { z } from "zod";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/picker/DatePicker";
import { TimePicker } from "@/components/ui/picker/TimePicker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { getProjectPhotoUrl } from "@/features/project-photos/utils/getProjectPhotoUrl";
import type { InvitationRenderPhoto } from "../../../types/invitationPhoto.types";
import { Button } from "@/components/ui/button";
import { getInvitationPageType, invitationPageTypes, isInvitationPageType } from "../../../config/invitationPageTypes";
import { getInvitationPageDesigns, resolveInvitationPageDesign } from "../../../config/invitationPageDesigns";
import type { InvitationTheme } from "../../../config/invitationThemes";
import { changeInvitationPageLayout, changeInvitationPageDesign } from "../../../utils/invitationDocumentOperations";
import type { InvitationDocumentPage } from "../../../types/invitationDocument.types";
import styles from "./InvitationContentPanel.module.css";

// Validate newly selected dates, not historical document content.
const selectedDateSchema = z.date().refine(
  date => startOfDay(date).getTime() >= startOfDay(new Date()).getTime(),
).optional();

interface InvitationContentPanelProps {
  photos: InvitationRenderPhoto[];
  page: InvitationDocumentPage;
  theme: InvitationTheme;
  disabled: boolean;
  onChange: (update: (page: InvitationDocumentPage) => InvitationDocumentPage) => void;
  onChoosePhoto: (slotId: string) => void;
}

export default function InvitationContentPanel({ page, theme, photos, disabled, onChange, onChoosePhoto }: InvitationContentPanelProps) {
  const fieldId = useId();
  const t = useTranslations("Invitations");
  const config = getInvitationPageType(page.type);
  const designs = getInvitationPageDesigns(page.type, theme);
  const selectedDesign = resolveInvitationPageDesign(page, theme);

  function renderField(field: (typeof config.fields)[number]) {
    const id = `${fieldId}-${field}`;
    const value = page.content[field] ?? "";
    const parsedDate = field === "date" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? parseISO(value)
      : undefined;
    const selectedDate = parsedDate && isValid(parsedDate) ? parsedDate : undefined;
    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
    const changeContent = (value: string) => {
      onChange(current => ({ ...current, content: { ...current.content, [field]: value } }));
    };

    return (
      <div className={styles.field} key={field}>
        <Label htmlFor={id}>
          {t(`fields.${field}`)}
        </Label>

        {field === "date" && page.layout === "date-card" ? (
          <DatePicker
            id={id}
            value={selectedDate}
            placeholder={value || t("fields.date")}
            onChange={date => {
              const result = selectedDateSchema.safeParse(date);
              if (!result.success) {
                toast.error(t("dateNotPast"));
                return;
              }
              changeContent(result.data ? format(result.data, "yyyy-MM-dd") : "");
            }}
            disabled={disabled}
            disablePast
            clearable
          />
        ) : field === "time" && page.layout === "date-card" ? (
          <>
            {value && !validTime && <p className={styles.hint}>{value}</p>}
            <TimePicker
              id={id}
              value={validTime ? value : null}
              onChange={time => changeContent(time ?? "")}
              disabled={disabled}
              minuteStep={1}
              clearable
            />
          </>
        ) : field === "text" || field === "schedule" ? (
          <Textarea
            id={id}
            rows={5}
            maxLength={10000}
            value={page.content[field] ?? ""}
            onChange={event => changeContent(event.target.value)} />
        ) : (
          <Input
            id={id}
            maxLength={10000}
            value={page.content[field] ?? ""}
            onChange={event => changeContent(event.target.value)} />
        )}
      </div>
    );
  }

  function changeDesign(designId: string) {
    onChange(current => changeInvitationPageDesign(current, designId, theme));
  }

  function changeType(type: string) {
    if (!isInvitationPageType(type)) return;
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

    {page.type === "cover" && page.layout === "photo-strip" ? (
      <>
        {renderField("firstName")}
        {renderField("secondName")}
        {!page.content.firstName?.trim() && !page.content.secondName?.trim() && renderField("title")}
        {renderField("subtitle")}
        {renderField("text")}
        {renderField("date")}
      </>
    ) : config.fields.filter(field => !config.optionalFields?.includes(field)).map(renderField)}
    {page.type === "cover" && page.layout === "poster" && (
      <>
        {renderField("location")}
        {renderField("address")}
      </>
    )}

    {!!config.optionalFields?.length && <details>
      <summary>
        {t("editor.moreContent")}
      </summary>
      {config.optionalFields.map(renderField)}
    </details>}

    {page.type === "rsvp" && <p className={styles.hint}>
      {t("editor.rsvpNote")}
    </p>}

    {page.photos.length > 0 && <>
      <h3>
        {t("editor.photos")}
      </h3>
      <div className={styles.photos}>
        {page.photos.map((slot, index) => {
          const photo = photos.find(photo => photo.id === slot.photoId);

          return <div key={slot.id} className={styles.photoItem}>
            <button
              type="button"
              className={styles.slotButton}
              onClick={() => onChoosePhoto(slot.id)}
              aria-label={t(slot.photoId ? "editor.replacePhoto" : "editor.choosePhoto", { number: index + 1 })}>
              {photo ? <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getProjectPhotoUrl(photo.image_path)} alt={photo.description ?? ""} />
              </> : <Plus aria-hidden="true" />}
            </button>

            {slot.photoId && <Button
              className={styles.photoRemove}
              size="icon"
              variant="secondary"
              aria-label={t("editor.clearPhoto")}
              onClick={() => onChange(current => ({ ...current, photos: current.photos.map(item => item.id === slot.id ? { ...item, photoId: null } : item) }))}>
              <X aria-hidden="true" />
            </Button>}
          </div>;
        })}
      </div>
    </>}

    {!!page.unplacedPhotos?.length && <p className={styles.hint}>
      {t("editor.retained", { count: page.unplacedPhotos.length })}
    </p>}
    <div className={styles.field}>
      <Label htmlFor={`${fieldId}-layout`}>
        {t("editor.pageDesign")}
      </Label>
      <Select
        id={`${fieldId}-layout`}
        value={selectedDesign.id}
        onValueChange={changeDesign}
        options={designs.map(design => ({ value: design.id, label: t(design.label) }))} />
    </div>
    <details>
      <summary>
        {t("editor.changeType")}
      </summary>
      <div className={styles.field}>
        <Label htmlFor={`${fieldId}-type`}>
          {t("editor.pageType")}
        </Label>
        <Select
          id={`${fieldId}-type`}
          value={page.type}
          onValueChange={changeType}
          options={Object.keys(invitationPageTypes).map(type => ({ value: type, label: t(`types.${type}`) }))} />
      </div>
    </details>
  </fieldset>;
}
