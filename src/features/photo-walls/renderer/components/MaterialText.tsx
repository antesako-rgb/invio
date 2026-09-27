import type { ReactNode, CSSProperties } from "react";
import type { PhotoWallMaterialField } from "../../content/photoWallMaterialFields";
import type { PhotoWallMaterialPresentation } from "../../types/photoWallMaterialPresentation.types";
import styles from "./MaterialText.module.css";

export default function MaterialText({ field, presentation, children, className = "" }: {
  field: PhotoWallMaterialField;
  presentation: PhotoWallMaterialPresentation;
  children: ReactNode;
  className?: string;
}) {
  const value = presentation.elements?.[field];
  const style: CSSProperties & Record<`--${string}`, string | number | undefined> = {
    "--text-font": value?.font_family,
    "--text-scale": value?.font_scale,
    "--text-color": value?.color,
    "--text-style": value?.font_style,
    "--text-weight": value?.font_weight,
    "--text-align": value?.text_align,
  };
  return <span className={`${styles.text} ${className}`} style={style} data-material-text>{children}</span>;
}
