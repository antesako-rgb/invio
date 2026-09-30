"use client";
import EditorDateTimeValue from "@/features/editor/components/EditorDateTimeValue/EditorDateTimeValue";
import { useTranslations } from "next-intl";
import EditorEditableText, { type EditorEditableTextProps } from "@/features/editor/components/EditorEditableText/EditorEditableText";
type Props = Omit<EditorEditableTextProps, "labels" | "onApply" | "attributes" | "valueAttributes"> & {
  field?: string;
  onChange?: (value: string) => void;
};
export default function DigitalAlbumEditableText({ field, onChange, ...props }: Props) {
  const t = useTranslations("DigitalAlbumEditor.upgrade");
  const dateT = useTranslations("Common.datePicker");
  if (field === "date" && props.editable) return <span
    className={props.className} data-album-text data-album-text-area data-album-field={field} data-opf-no-flip>
    <span data-album-text-value>
      <EditorDateTimeValue kind="date" value={props.value} display={props.displayValue || props.value || props.placeholder}
        label={props.placeholder}
        labels={{ clear: dateT("clear"), cancel: t("cancel"), apply: t("apply"), invalid: t("invalidDate") }}
        onApply={value => onChange?.(value)} />
    </span>
  </span>;
  return <EditorEditableText {...props}
    attributes={{ "data-album-text": true, "data-album-text-area": true, "data-album-field": field, "data-opf-no-flip": props.editable || undefined } as React.HTMLAttributes<HTMLSpanElement>}
    valueAttributes={{ "data-album-text-value": true } as React.HTMLAttributes<HTMLSpanElement>}
    labels={{ edit: t("editText"), cancel: t("cancel"), apply: t("apply") }}
    onApply={onChange} />;
}
