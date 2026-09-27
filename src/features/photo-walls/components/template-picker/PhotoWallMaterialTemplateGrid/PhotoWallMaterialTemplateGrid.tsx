import PhotoWallMaterialTemplateCard from "../PhotoWallMaterialTemplateCard/PhotoWallMaterialTemplateCard";
import type { PhotoWallMaterialTemplateEntry } from "../../../cards/registry/photoWallMaterialTemplateRegistry.utils";
import styles from "./PhotoWallMaterialTemplateGrid.module.css";

export default function PhotoWallMaterialTemplateGrid({ templates, disabled = false, creatingTemplateId = null, onSelect }: {
  templates: PhotoWallMaterialTemplateEntry[]; disabled?: boolean; creatingTemplateId?: string | null;
  onSelect: (templateId: string, variantId: string) => void;
}) {
  return <div className={styles.grid}>{templates.map(({ id, config }) =>
    <PhotoWallMaterialTemplateCard key={id} templateId={id} template={config} disabled={disabled}
      isCreating={creatingTemplateId === id} onSelect={onSelect} />)}</div>;
}
