import { getInvitationPageType } from "../../config/invitationPageTypes";
import type { InvitationDocumentPage } from "../../types/invitationDocument.types";
import styles from "./InvitationPageContent.module.css";

/* ==========================================================================
   Types
========================================================================== */

interface InvitationPageContentProps {
  page: InvitationDocumentPage;
  locale: string;
}

/* ==========================================================================
   Invitation Page Content
========================================================================== */

export function InvitationPageContent({ page, locale }: InvitationPageContentProps) {
  const fields = getInvitationPageType(page.type).fields;
  return (
    <div className={styles.copy}>
      {fields.map(field => {
        const text = page.content[field];
        if (!text?.trim()) {
          return null;
        }
        if (field === "title") {
          return <h2 key={field}>{text}</h2>;
        }
        if (field === "subtitle") {
          return <p key={field} className={styles.subtitle}>{text}</p>;
        }
        if (field === "schedule") {
          return (
            <ol key={field} className={styles.schedule}>
              {text.split("\n").filter(line => line.trim()).map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ol>
          );
        }
        if (field === "date" && /^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(Date.parse(text))) {
          return (
            <p key={field}>
              <time dateTime={text}>
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: "long",
                  timeZone: "UTC",
                }).format(new Date(text))}
              </time>
            </p>
          );
        }
        return <p key={field}>{text}</p>;
      })}
    </div>
  );
}
