import type { ReactNode } from "react";
import type { DigitalAlbumPageContent } from "../../../../types/digitalAlbumDocument.types";

export interface Parts {
  photo: (index: number) => ReactNode;
  text: (field: keyof DigitalAlbumPageContent) => ReactNode;
}
