"use client";

import { useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog";
import type { ProjectCollaborationInvite } from "../types/projectCollaboration.types";
import CollaborationLinkForm from "./CollaborationLinkForm";
import CollaborationMemberActions from "./CollaborationMemberActions";
import styles from "./Collaboration.module.css";

export default function PendingCollaborationInvites({ projectId, invites, now }: {
  projectId: string; invites: ProjectCollaborationInvite[]; now: string;
}) {
  const t = useTranslations("Projects.collaboration");
  const format = useFormatter();
  const [selected, setSelected] = useState<ProjectCollaborationInvite | null>(null);
  const busy = useRef(false);
  return <>
    <ul className={styles.list}>
      {invites.map(invite => {
        const expired = new Date(invite.expires_at).getTime() <= new Date(now).getTime();
        return <li key={invite.id} className={styles.row}>
          <div className={styles.rowContent}>
            <span>{invite.email}</span>
            <p className={styles.description}>{t("expires", { date: format.dateTime(new Date(invite.expires_at), { dateStyle: "medium", timeStyle: "short" }) })}</p>
          </div>
          <div className={styles.rowActions}>
            <Badge variant={expired ? "muted" : "warning"}>{t(expired ? "expired" : "pending")}</Badge>
            <Button size="sm" variant="ghost" onClick={() => setSelected(invite)}>{t("renewLink")}</Button>
            <CollaborationMemberActions kind="invite" inviteId={invite.id} email={invite.email} />
          </div>
        </li>;
      })}
    </ul>
    <Dialog open={!!selected} onOpenChange={(open, details) => {
      if (busy.current) { details.cancel(); return; }
      if (!open) setSelected(null);
    }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("renewLink")}</DialogTitle></DialogHeader>
        {selected && <CollaborationLinkForm key={selected.id} projectId={projectId}
          inviteId={selected.id} initialEmail={selected.email} onBusyChange={value => { busy.current = value; }} />}
      </DialogContent>
    </Dialog>
  </>;
}
