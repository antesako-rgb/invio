import { Images, Layers, LayoutTemplate, Palette } from "lucide-react";
interface Translations { (key: "navigation.pages" | "navigation.photos" | "navigation.templates" | "navigation.theme"): string; }
export function getDigitalAlbumEditorNavigationItems(t: Translations) {
  return [
    { id: "pages", href: "#pages", label: t("navigation.pages"), icon: Layers },
    { id: "photos", href: "#photos", label: t("navigation.photos"), icon: Images },
    { id: "templates", href: "#templates", label: t("navigation.templates"), icon: LayoutTemplate },
    { id: "theme", href: "#theme", label: t("navigation.theme"), icon: Palette },
  ];
}
