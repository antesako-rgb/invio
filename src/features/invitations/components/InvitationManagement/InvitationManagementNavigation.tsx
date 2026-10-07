"use client";
import { useActionError } from "@/lib/actions/useActionError";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import ManagementHeader from "@/features/management/components/ManagementHeader/ManagementHeader";
import ManagementNameEdit from "@/features/management/components/ManagementNameEdit/ManagementNameEdit";
import ManagementStatusBadge from "@/features/management/components/ManagementStatusBadge/ManagementStatusBadge";
import SideNavigation from "@/components/ui/side-navigation/SideNavigation";
import { ButtonLink } from "@/components/ui/button-link";
import { updateInvitationAction } from "../../actions/invitation/updateInvitationAction";
import type { getInvitation } from "../../repositories/invitation/getInvitation";

export default function InvitationManagementNavigation({ invitation: selected }: { invitation: Pick<NonNullable<Awaited<ReturnType<typeof getInvitation>>>, "id" | "name" | "is_public"> }) {
  const actionError = useActionError();
  const t = useTranslations("Invitations.management");
  const router = useRouter();
  const base = `/dashboard/invitations/${selected.id}`;
  return <>
    <ManagementHeader heading={selected ? <ManagementNameEdit key={`${selected.id}:${selected.name}`} name={selected.name}
      editLabel={t("rename")} inputLabel={t("name")} saveLabel={t("save")} cancelLabel={t("cancel")} errorLabel={t("error")}
      onSave={async name => { const result = await updateInvitationAction(selected.id, name); if (!result.success) throw new Error(actionError(result.code)); router.refresh(); return name.trim(); }} /> : <h1>{t("title")}</h1>}
      status={selected && <ManagementStatusBadge isPublished={selected.is_public} publishedLabel={t("published")} draftLabel={t("draft")} />}
      actions={selected && <ButtonLink href={`/editor/invitation/${selected.id}/uredi`}>{t("edit")}</ButtonLink>} />
    <SideNavigation appearance="underline" variant="route" ariaLabel={t("title")}
      items={["overview", "guests", "templates", "settings"].map(id => ({ id, href: `${base}${id === "overview" ? "" : `/${id}`}`, label: t(id), exact: id === "overview" }))} />
  </>;
}
