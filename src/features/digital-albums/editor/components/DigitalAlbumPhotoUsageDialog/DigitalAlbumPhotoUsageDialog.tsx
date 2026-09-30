"use client";
import { useTranslations } from "next-intl";
import EditorPhotoUsageDialog from "@/features/editor/components/EditorPhotoUsageDialog/EditorPhotoUsageDialog";
import type { DigitalAlbumPhotoReference } from "../../../utils/digitalAlbumPhotoReferences";
interface Props {
  imageUrl?: string;
  references: DigitalAlbumPhotoReference[];
  onClose: () => void;
  onNavigate: (reference: DigitalAlbumPhotoReference) => void;
  deleting: boolean;
  busy: boolean;
  onDelete: () => Promise<boolean>;
}

export default function DigitalAlbumPhotoUsageDialog({ references, onNavigate, ...props }: Props) {
  const t = useTranslations("DigitalAlbumEditor.photoUsage");
  return <EditorPhotoUsageDialog {...props}
    references={references.map(reference => ({ id: reference.slotId, label: t("page", { number: reference.pageNumber }), hint: reference.retained ? t("retained") : undefined }))}
    onNavigate={id => { const reference = references.find(item => item.slotId === id); if (reference) onNavigate(reference); }}
    labels={{ title: t("title"), description: t(props.deleting ? "description" : "infoDescription", { count: references.length }), locations: t("locations"), cancel: t("cancel"), removeAll: t("removeAll"), confirmTitle: t("confirmTitle"), confirmDescription: t("confirmDescription", { count: references.length }), confirm: t("confirm", { count: references.length }) }} />;
}
