import type { InvitationPresentation } from "./InvitationPresentation";
import { allura, marcellus, playfairDisplay } from "@/styles/fonts/albumMaterialFonts";
import { resolveInvitationPageDesign } from "../../config/invitationPageDesigns";
import { resolveInvitationPageDateTime } from "../../utils/invitationSharedDateTime";

import type {
  InvitationDocument,
} from "../../types/invitationDocument.types";

import type {
  InvitationRenderPhoto,
} from "../../types/invitationPhoto.types";

import {
  invitationLayoutComponents,
} from "./InvitationLayouts";

import styles
  from "./InvitationRenderer.module.css";

import themes
  from "./themes/InvitationThemes.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRendererProps {
  presentation?: (page: InvitationDocument["pages"][number]) => InvitationPresentation;
  document: InvitationDocument;
  photos: InvitationRenderPhoto[];
  locale: string;
  showPhotoPlaceholders?: boolean;
}


/* ==========================================================================
   Invitation Renderer
========================================================================== */

export default function InvitationRenderer({
  document,
  presentation,
  photos,
  locale,
  showPhotoPlaceholders = false,
}: InvitationRendererProps) {
  // Reuse existing next/font instances without registering fonts a second time.
  const themeFonts = document.theme === "botanical"
    ? `${marcellus.variable} ${playfairDisplay.variable} ${allura.variable}`
    : "";

  const assets =
    new Map(
      photos.map(
        (photo) => [
          photo.id,
          photo,
        ]
      )
    );

  return (
    <div
      className={
        `${styles.invitation} ${themes.theme} ${themeFonts}`
      }
      data-theme={
        document.theme
      }
    >
      {document.pages.map(
        (page) => {
          const design = resolveInvitationPageDesign(page, document.theme);
          const Layout =
            invitationLayoutComponents[
              page.layout
            ];

          return (
            <section
              key={
                page.id
              }
              className={
                `${styles.section} ${themes.pageDesign}`
              }
              data-layout={page.layout}
              data-variant={design.variant}
              data-invitation-page={
                page.id
              }
              data-page-type={
                page.type
              }
            >
              <Layout
                presentation={presentation?.(page)}
                page={
                  resolveInvitationPageDateTime(document, page)
                }
                photos={
                  assets
                }
                locale={
                  locale
                }
                showPhotoPlaceholders={
                  showPhotoPlaceholders
                }
              />
            </section>
          );
        }
      )}
    </div>
  );
}
