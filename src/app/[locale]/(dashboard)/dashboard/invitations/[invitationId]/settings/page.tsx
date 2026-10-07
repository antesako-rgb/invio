import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ManagementStatusCard from "@/features/management/components/ManagementStatusCard/ManagementStatusCard";
import ManagementPublicLinkCard from "@/features/management/components/ManagementPublicLinkCard/ManagementPublicLinkCard";
import InvitationPublishAction from "@/features/invitations/components/InvitationManagement/InvitationPublishAction";
import InvitationGenericRsvpSettings from "@/features/invitations/components/InvitationManagement/InvitationGenericRsvpSettings";
import { getInvitation } from "@/features/invitations/repositories/invitation/getInvitation";
import styles from "@/features/invitations/components/InvitationManagement/InvitationManagement.module.css";
export default async function Page({ params }: { params: Promise<{ invitationId: string }> }) {
  const [selected, t] = await Promise.all([getInvitation((await params).invitationId), getTranslations("Invitations.management")]);
  if (!selected) notFound();
  return <div className={styles.list}>
    <ManagementStatusCard title={t("invitationStatus")} description={selected.name} isPublished={selected.is_public}
      statusTitle={t(selected.is_public ? "published" : "draft")} statusDescription={t(selected.is_public ? "publishedHint" : "draftHint")}
      action={<InvitationPublishAction id={selected.id} published={selected.is_public} />} />
    <ManagementPublicLinkCard title={t("publicLink")} description={t("shareHint")} publicPath={`/invitation/${selected.public_id}`} isActive={selected.is_public}
      activeTitle={t("linkActive")} inactiveTitle={t("linkInactive")} activeDescription={t("publishedHint")} inactiveDescription={t("draftHint")}
      copyLabel={t("copyLink")} copiedLabel={t("copied")} openLabel={t("publicLink")} />
    <InvitationGenericRsvpSettings key={selected.id} invitation={selected} />
  </div>;
}
