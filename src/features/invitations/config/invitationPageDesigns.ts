import { invitationLayouts, type InvitationLayout } from "./invitationLayouts";
import { getInvitationPageType, type InvitationPageType } from "./invitationPageTypes";
import type { InvitationTheme } from "./invitationThemes";

/* ==========================================================================
   Page Designs
========================================================================== */

export interface InvitationPageDesign {
  id: string;
  variant: string;
  layout: InvitationLayout;
  pageTypes?: readonly InvitationPageType[];
  themes?: readonly InvitationTheme[];
  label: string;
  legacyDefault?: boolean;
}

// Structural defaults reuse the existing type/layout compatibility registry.
// Additional designs restrict that compatibility, never expand it.
export const invitationPageDesigns: readonly InvitationPageDesign[] = [
  ...Object.keys(invitationLayouts).map(layout => ({
    id: `${layout}:default`,
    variant: "default",
    layout: layout as InvitationLayout,
    label: `layouts.${layout}`,
  })),
  {
    id: "botanical:ornamental:watercolor",
    variant: "watercolor",
    layout: "ornamental",
    pageTypes: ["cover"],
    themes: ["botanical"],
    label: "designs.watercolor",
    legacyDefault: true,
  },
];

export function getInvitationPageDesigns(type: InvitationPageType, theme: InvitationTheme) {
  return getInvitationPageType(type).layouts.flatMap(layout => (
    invitationPageDesigns.filter(design => (
      design.layout === layout
      && (!design.pageTypes || design.pageTypes.includes(type))
      && (!design.themes || design.themes.includes(theme))
    ))
  ));
}

export function resolveInvitationPageDesign(
  page: { type: InvitationPageType; layout: InvitationLayout; variant?: string },
  theme: InvitationTheme,
): InvitationPageDesign {
  const designs = getInvitationPageDesigns(page.type, theme)
    .filter(design => design.layout === page.layout);

  const selected = page.variant === undefined
    ? designs.find(design => design.legacyDefault)
    : designs.find(design => design.variant === page.variant);

  // Unknown or incompatible variants remain in JSON but render safely.
  const fallback = designs.find(design => design.variant === "default");
  if (!fallback) throw new Error("Unsupported Invitation page design");
  return selected ?? fallback;
}
