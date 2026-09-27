import { FileText, Palette, QrCode } from "lucide-react";

export function getPhotoWallMaterialEditorNavigationItems(t: (key: string) => string) {
  return [
    { id: "content", href: "#content", label: t("navigation.content"), icon: FileText },
    { id: "design", href: "#design", label: t("navigation.design"), icon: Palette },
    { id: "qr", href: "#qr", label: t("navigation.qr"), icon: QrCode },
  ];
}
