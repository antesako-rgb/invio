import Image from "next/image";

import {
  getTranslations,
} from "next-intl/server";

import {
  Badge,
} from "@/components/ui/badge/badge";

import {
  ButtonLink,
} from "@/components/ui/button-link";


import styles from "./EventProducts.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventProduct {
  id: string;
  event_id: string;
  name: string;
  is_public: boolean;
}

interface EventProductsProps {
  eventId:
    string;

  photoWall:
    EventProduct | null;

  digitalAlbum:
    EventProduct | null;
}


/* ==========================================================================
   Event Products
========================================================================== */

export default async function EventProducts({
  eventId,
  photoWall,
  digitalAlbum,
}: EventProductsProps) {
  const t =
    await getTranslations(
      "Events.products"
    );

  const entries = [
    {
      key:
        "photoWall",

      path:
        "photo-wall",

      imageSrc:
        "/assets/dashboard/photo-wall-preview.png",

      imageAlt:
        "",

      product:
        photoWall,
    },
    {
      key:
        "album",

      path:
        "albumi",

      imageSrc:
        "/assets/dashboard/digital-album-preview.png",

      imageAlt:
        "",

      product:
        digitalAlbum,
    },
  ] as const;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <section
      className={
        styles.grid
      }
    >
      {entries.map(({
        key,
        path,
        imageSrc,
        imageAlt,
        product,
      }) => {
        const status =
          !product
            ? "empty"
            : product.is_public
              ? "published"
              : "draft";

        return (
          <article
            key={
              key
            }
            className={
              styles.card
            }
          >
            <div
              className={
                styles.visual
              }
            >
              <Image
                src={
                  imageSrc
                }
                alt={
                  imageAlt
                }
                width={
                  220
                }
                height={
                  160
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
              <div
                className={
                  styles.heading
                }
              >
                <div>
                  <h2
                    className={
                      styles.title
                    }
                  >
                    {t(
                      `${key}.title`
                    )}
                  </h2>

                  <p
                    className={
                      styles.description
                    }
                  >
                    {t(
                      `${key}.description`
                    )}
                  </p>
                </div>

                <Badge
                  variant={
                    status === "published"
                      ? "success"
                      : status === "draft"
                        ? "warning"
                        : "muted"
                  }
                >
                  {t(
                    status === "empty"
                      ? `${key}.empty`
                      : status
                  )}
                </Badge>
              </div>

              <div
                className={
                  styles.actions
                }
              >
                <ButtonLink
                  href={`/dashboard/dogadaji/${eventId}/${path}`}
                  variant="outline"
                  size="lg"
                >
                  {t(
                    `${key}.open`
                  )}
                </ButtonLink>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}