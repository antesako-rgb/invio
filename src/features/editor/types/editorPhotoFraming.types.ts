/** Presentation of one image usage; normalized CSS object-position, not a source crop. */
export type EditorPhotoFramingValue = {
  position?: { x: number; y: number };
  fit?: "cover" | "contain";
};
