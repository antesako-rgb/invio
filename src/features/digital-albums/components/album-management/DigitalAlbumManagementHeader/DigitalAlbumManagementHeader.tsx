import {
  Eye,
  SquarePen,
} from "lucide-react";

import {
  getLocale,
  getTranslations,
} from "next-intl/server";

import {
  ButtonLink,
} from "@/components/ui/button-link";

import DigitalAlbumNameEdit
  from "@/features/digital-albums/components/album-management/DigitalAlbumManagementHeader/DigitalAlbumNameEdit/DigitalAlbumNameEdit";

import type {
  DigitalAlbum,
} from "@/features/digital-albums/types/digitalAlbum.types";

import {
  getDigitalAlbumPublicPath,
} from "@/features/digital-albums/utils/getDigitalAlbumPublicPath";

import ManagementHeader
  from "@/features/management/components/ManagementHeader/ManagementHeader";

import ManagementStatusBadge
  from "@/features/management/components/ManagementStatusBadge/ManagementStatusBadge";

import styles
  from "./DigitalAlbumManagementHeader.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumManagementHeaderProps {
  album:
    DigitalAlbum;
}


/* ==========================================================================
   Digital Album Management Header
========================================================================== */

export default async function DigitalAlbumManagementHeader({
  album,
}: DigitalAlbumManagementHeaderProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const [
    t,
    locale,
  ] =
    await Promise.all([
      getTranslations(
        "DigitalAlbums.management"
      ),
      getLocale(),
    ]);


  /* ==========================================================================
     Status
  ========================================================================== */

  const isPublished =
    album.is_public;


  /* ==========================================================================
     Updated At
  ========================================================================== */

  const updatedAt =
    new Intl.DateTimeFormat(
      locale,
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",
      }
    ).format(
      new Date(
        album.updated_at
      )
    );


  /* ==========================================================================
     Public Path
  ========================================================================== */

  const publicPath =
    getDigitalAlbumPublicPath(
      album.public_id
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <ManagementHeader
      backHref={
        `/dashboard/dogadaji/${album.event_id}/albumi`
      }
      backLabel={
        t(
          "backToAlbums"
        )
      }
      heading={
        <DigitalAlbumNameEdit
          albumId={
            album.id
          }
          name={
            album.name
          }
        />
      }
      status={
        <ManagementStatusBadge
          isPublished={
            isPublished
          }
          publishedLabel={
            t(
              "status.published"
            )
          }
          draftLabel={
            t(
              "status.draft"
            )
          }
        />
      }
      meta={
        <span
          className={
            styles.updated
          }
        >
          {t(
            "updatedAt",
            {
              date:
                updatedAt,
            }
          )}
        </span>
      }
      actions={
        <>
          {isPublished && (
            <ButtonLink
              href={
                publicPath
              }
              variant="outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Eye
                aria-hidden="true"
              />

              {t(
                "actions.view"
              )}
            </ButtonLink>
          )}

          <ButtonLink
            href={
              `/editor/album/${album.id}/uredi`
            }
          >
            <SquarePen
              aria-hidden="true"
            />

            {t(
              "actions.edit"
            )}
          </ButtonLink>
        </>
      }
    />
  );
}