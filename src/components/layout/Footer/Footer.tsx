import {
  Link,
} from "@/i18n/navigation";

import {
  getTranslations,
} from "next-intl/server";

import styles from "./Footer.module.css";


/* ==========================================================================
   Footer
========================================================================== */

export default async function Footer() {
  const t =
    await getTranslations(
      "Footer"
    );

  const year =
    new Date().getFullYear();

  return (
    <footer
      className={
        styles.footer
      }
    >
      <div
        className={
          styles.container
        }
      >
        <div
          className={
            styles.top
          }
        >
          <div
            className={
              styles.brand
            }
          >
            <Link
              href="/"
              className={
                styles.logo
              }
            >
              Invio
            </Link>

            <p
              className={
                styles.description
              }
            >
              {t(
                "description"
              )}
            </p>
          </div>

          <div
            className={
              styles.links
            }
          >
            <div
              className={
                styles.linkGroup
              }
            >
              <h4>
                {t(
                  "platform.title"
                )}
              </h4>

              <Link
                href="/"
              >
                {t(
                  "platform.home"
                )}
              </Link>
            </div>

            <div
              className={
                styles.linkGroup
              }
            >
              <h4>
                {t(
                  "account.title"
                )}
              </h4>

              <Link
                href="/prijava"
              >
                {t(
                  "account.login"
                )}
              </Link>

              <Link
                href="/registracija"
              >
                {t(
                  "account.register"
                )}
              </Link>
            </div>

            <div
              className={
                styles.linkGroup
              }
            >
              <h4>
                {t(
                  "legal.title"
                )}
              </h4>

              <Link
                href="/pravila-privatnosti"
              >
                {t(
                  "legal.privacy"
                )}
              </Link>

              <Link
                href="/uvjeti-koristenja"
              >
                {t(
                  "legal.terms"
                )}
              </Link>

              <Link
                href="/kolacici"
              >
                {t(
                  "legal.cookies"
                )}
              </Link>
            </div>
          </div>
        </div>

        <div
          className={
            styles.bottom
          }
        >
          <span>
            {t(
              "copyright",
              {
                year,
              }
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}