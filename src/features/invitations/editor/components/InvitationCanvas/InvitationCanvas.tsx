import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import styles from "./InvitationCanvas.module.css";

interface InvitationCanvasProps { children: ReactNode; navigator?: ReactNode }

export default function InvitationCanvas({ children, navigator }: InvitationCanvasProps) {
  const t = useTranslations("Invitations.editor");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  return <div className={styles.canvas}>
    <div className={styles.controls} role="group" aria-label={t("viewport")}>
      {(["desktop", "tablet", "mobile"] as const).map(value => <Button
        key={value}
        size="sm"
        variant={device === value ? "default" : "ghost"}
        aria-pressed={device === value}
        onClick={() => setDevice(value)}>
        {t(value)}
      </Button>)}
    </div>
    {navigator}
    <div className={styles.frame} data-device={device}>
      {children}
    </div>
  </div>;
}
