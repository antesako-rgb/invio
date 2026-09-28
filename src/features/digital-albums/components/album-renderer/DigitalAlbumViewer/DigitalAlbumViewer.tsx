"use client";

import DigitalAlbumReaderFrame from "./DigitalAlbumReaderFrame";
import DigitalAlbumRenderer from "../DigitalAlbumRenderer/DigitalAlbumRenderer";
import type { DigitalAlbumDocument } from "../../../types/digitalAlbumDocument.types";
import type { DigitalAlbumRendererPhoto } from "../types/digitalAlbumRenderer.types";

export default function DigitalAlbumViewer({ document, photos }: {
  document: DigitalAlbumDocument;
  photos: DigitalAlbumRendererPhoto[];
}) {
  return <DigitalAlbumReaderFrame document={document} photos={photos}>
    {(controls) => <DigitalAlbumRenderer document={document} photos={photos} {...controls} />}
  </DigitalAlbumReaderFrame>;
}
