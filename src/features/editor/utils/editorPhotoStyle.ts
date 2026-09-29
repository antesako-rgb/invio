import type { EditorPhotoFramingValue } from "../types/editorPhotoFraming.types";

export function editorPhotoStyle(value: EditorPhotoFramingValue) {
  return {
    objectFit: value.fit ?? "cover",
    objectPosition: `${(value.position?.x ?? 0.5) * 100}% ${(value.position?.y ?? 0.5) * 100}%`,
  };
}
