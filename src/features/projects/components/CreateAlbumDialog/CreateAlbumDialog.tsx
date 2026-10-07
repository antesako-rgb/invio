"use client";

import { useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog/dialog";
import CreateAlbumForm from "../CreateAlbumForm/CreateAlbumForm";

interface CreateAlbumDialogProps {
  projectId: string;
  children?: ReactNode;
  className?: string;
}

export default function CreateAlbumDialog({ projectId, children, className }: CreateAlbumDialogProps) {
  const t = useTranslations("Projects.create");
  const [open, setOpen] = useState(false);
  const busy = useRef(false);

  return (
    <Dialog open={open} onOpenChange={(nextOpen, details) => {
      if (busy.current) {
        details.cancel();
        return;
      }
      setOpen(nextOpen);
    }}>
      <DialogTrigger render={<Button className={className} />}>
        {children ?? t("createAlbum")}
      </DialogTrigger>
      <DialogContent keepMounted>
        <DialogHeader>
          <DialogTitle>{t("createAlbum")}</DialogTitle>
          <DialogDescription>{t("albumDescription")}</DialogDescription>
        </DialogHeader>
        <CreateAlbumForm
          projectId={projectId}
          onBusyChange={value => { busy.current = value; }}
          onCancel={() => { if (!busy.current) setOpen(false); }}
        />
      </DialogContent>
    </Dialog>
  );
}
