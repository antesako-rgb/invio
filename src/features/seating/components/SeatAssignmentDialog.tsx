"use client";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog/dialog";
import SeatAssignmentForm, { type SeatAssignmentFormProps } from "./SeatAssignmentForm";
import styles from "./SeatAssignmentDialog.module.css";
export type { SeatAssignmentRequest } from "../validation/seatAssignmentChoices";
export default function SeatAssignmentDialog(props: SeatAssignmentFormProps) {
  const t = useTranslations("Seating");
  return <Dialog open onOpenChange={open => { if (!open && !props.saving) props.onClose(); }}>
    <DialogContent positioning="custom" className={styles.dialog} closeLabel={t("cancel")} aria-busy={props.saving}>
      <DialogHeader className={styles.header}><DialogTitle>{t("seatAssignmentTitle")}</DialogTitle><DialogDescription>{t("seatAssignmentHelp")}</DialogDescription></DialogHeader>
      <SeatAssignmentForm {...props} />
    </DialogContent>
  </Dialog>;
}
