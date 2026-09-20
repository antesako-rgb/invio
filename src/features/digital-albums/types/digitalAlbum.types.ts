import type {
  Tables,
} from "@/lib/supabase/database.types";

import type {
  PublicDigitalAlbumPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import type {
  DigitalAlbumDocument,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";


/* ==========================================================================
   Digital Album
========================================================================== */

export type DigitalAlbum =
  Tables<"digital_albums">;


/* ==========================================================================
   Create Digital Album Input
========================================================================== */

export interface CreateDigitalAlbumInput {
  eventId:
    string;

  name:
    string;
}


/* ==========================================================================
   Update Digital Album Input
========================================================================== */

export interface UpdateDigitalAlbumInput {
  albumId:
    string;

  name:
    string;
}


/* ==========================================================================
   Update Digital Album Document Input
========================================================================== */

export interface UpdateDigitalAlbumDocumentInput {
  albumId:
    string;

  document:
    DigitalAlbumDocument;

  documentVersion:
    number;
}


/* ==========================================================================
   Publish Digital Album Input
========================================================================== */

export interface PublishDigitalAlbumInput {
  albumId:
    string;
}


/* ==========================================================================
   Unpublish Digital Album Input
========================================================================== */

export interface UnpublishDigitalAlbumInput {
  albumId:
    string;
}


/* ==========================================================================
   Delete Digital Album Input
========================================================================== */

export interface DeleteDigitalAlbumInput {
  albumId:
    string;
}


/* ==========================================================================
   Get Public Digital Album Input
========================================================================== */

export interface GetPublicDigitalAlbumInput {
  publicId:
    string;
}


/* ==========================================================================
   Public Digital Album
========================================================================== */

export interface PublicDigitalAlbum {
  album: {
    public_id:
      string;

    name:
      string;

    published_at:
      string;

    document:
      DigitalAlbumDocument;

    document_version:
      number;
  };

  photos:
    PublicDigitalAlbumPhoto[];
}