import Image from "next/image";

import {
  Plus,
} from "lucide-react";

import {
  getTranslations,
} from "next-intl/server";

import styles from "./DashboardProductsIntro.module.css";


/* ==========================================================================
   Dashboard Products Intro
========================================================================== */

export default async function DashboardProductsIntro() {
  const t =
    await getTranslations(
      "Dashboard.overview.events.empty"
    );

  return (
    <section
      className={
        styles.section
      }
    >
      <article
        className={
          styles.product
        }
      >
        <div
          className={
            styles.visual
          }
        >
          <Image
            src="/assets/dashboard/photo-wall-preview.png"
            alt=""
            width={
              160
            }
            height={
              120
            }
            className={
              styles.image
            }
          />
        </div>

        <div
          className={
            styles.content
          }
        >
          <h3
            className={
              styles.title
            }
          >
            {t(
              "photoWall.title"
            )}
          </h3>

          <p
            className={
              styles.description
            }
          >
            {t(
              "photoWall.description"
            )}
          </p>
        </div>
      </article>

      <Plus
        className={
          styles.plus
        }
        aria-hidden="true"
      />

      <article
        className={
          styles.product
        }
      >
        <div
          className={
            styles.visual
          }
        >
          <Image
            src="/assets/dashboard/digital-album-preview.png"
            alt=""
            width={
              160
            }
            height={
              120
            }
            className={
              styles.image
            }
          />
        </div>

        <div
          className={
            styles.content
          }
        >
          <h3
            className={
              styles.title
            }
          >
            {t(
              "album.title"
            )}
          </h3>

          <p
            className={
              styles.description
            }
          >
            {t(
              "album.description"
            )}
          </p>
        </div>
      </article>
    </section>
  );
}