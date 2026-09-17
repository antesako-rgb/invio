"use client";

import DigitalAlbumFlipBook
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumFlipBook/DigitalAlbumFlipBook";

import DigitalAlbumPage
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumPage/DigitalAlbumPage";

import styles
  from "./DigitalAlbumDemo.module.css";


/* ==========================================================================
   Demo Photos
========================================================================== */

const photos = {
  couple:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85",

  table:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85",

  rings:
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85",

  celebration:
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=85",
};


/* ==========================================================================
   Digital Album Demo
========================================================================== */

export default function DigitalAlbumDemo() {
  return (
    <main
      className={
        styles.root
      }
    >
      <div
        className={
          styles.header
        }
      >
        <span
          className={
            styles.eyebrow
          }
        >
          DIGITALNI ALBUM
        </span>

        <h1>
          Naše uspomene
        </h1>

        <p>
          Ana & Marko · 15. lipnja 2027.
        </p>
      </div>

      <div
        className={
          styles.bookArea
        }
      >
        <DigitalAlbumFlipBook
          width={
            480
          }
          height={
            640
          }
        >
          {/* Cover */}

          <DigitalAlbumPage
            hard
            className={
              styles.cover
            }
          >
            <img
              src={
                photos.couple
              }
              alt=""
              className={
                styles.coverImage
              }
            />

            <div
              className={
                styles.coverOverlay
              }
            />

            <div
              className={
                styles.coverContent
              }
            >
              <span>
                15 · 06 · 2027
              </span>

              <h2>
                Ana

                <em>
                  &
                </em>

                Marko
              </h2>

              <p>
                Naše uspomene
              </p>
            </div>
          </DigitalAlbumPage>

          {/* Page 1 */}

          <DigitalAlbumPage>
            <div
              className={
                styles.introPage
              }
            >
              <span
                className={
                  styles.smallLabel
                }
              >
                NAŠ DAN
              </span>

              <h2>
                Naše
                <br />
                vjenčanje
              </h2>

              <div
                className={
                  styles.divider
                }
              />

              <p>
                15. lipnja 2027.
              </p>

              <p
                className={
                  styles.quote
                }
              >
                Jedan dan.
                <br />
                Tisuću uspomena.
              </p>
            </div>

            <span
              className={
                styles.pageNumber
              }
            >
              1
            </span>
          </DigitalAlbumPage>

          {/* Page 2 */}

          <DigitalAlbumPage>
            <div
              className={
                styles.fullPhoto
              }
            >
              <img
                src={
                  photos.table
                }
                alt=""
              />

              <div
                className={
                  styles.photoCaption
                }
              >
                <span>
                  02
                </span>

                <p>
                  Posebni trenuci
                </p>
              </div>
            </div>
          </DigitalAlbumPage>

          {/* Page 3 */}

          <DigitalAlbumPage>
            <div
              className={
                styles.editorialPage
              }
            >
              <div
                className={
                  styles.editorialHeading
                }
              >
                <span>
                  ZAJEDNO
                </span>

                <h2>
                  Trenuci koje
                  <br />
                  pamtimo
                </h2>
              </div>

              <img
                src={
                  photos.rings
                }
                alt=""
                className={
                  styles.editorialImage
                }
              />

              <p
                className={
                  styles.editorialText
                }
              >
                Najljepše stvari u životu
                nisu stvari, nego trenuci
                koje dijelimo.
              </p>
            </div>

            <span
              className={
                styles.pageNumber
              }
            >
              3
            </span>
          </DigitalAlbumPage>

          {/* Page 4 */}

          <DigitalAlbumPage>
            <div
              className={
                styles.collage
              }
            >
              <img
                src={
                  photos.celebration
                }
                alt=""
              />

              <img
                src={
                  photos.table
                }
                alt=""
              />

              <img
                src={
                  photos.couple
                }
                alt=""
              />

              <div
                className={
                  styles.collageText
                }
              >
                <span>
                  04
                </span>

                <h2>
                  Obitelj
                  <br />
                  i prijatelji
                </h2>
              </div>
            </div>
          </DigitalAlbumPage>

          {/* Page 5 */}

          <DigitalAlbumPage>
            <div
              className={
                styles.fullPhoto
              }
            >
              <img
                src={
                  photos.couple
                }
                alt=""
              />

              <div
                className={
                  styles.photoCaption
                }
              >
                <span>
                  05
                </span>

                <p>
                  Zauvijek zajedno
                </p>
              </div>
            </div>
          </DigitalAlbumPage>

          {/* Back Cover */}

          <DigitalAlbumPage
            hard
            className={
              styles.backCover
            }
          >
            <div>
              <span
                className={
                  styles.smallLabel
                }
              >
                HVALA
              </span>

              <h2>
                Hvala što ste
                <br />
                dio naše priče.
              </h2>

              <div
                className={
                  styles.divider
                }
              />

              <p>
                Ana & Marko
              </p>

              <span
                className={
                  styles.date
                }
              >
                15 · 06 · 2027
              </span>
            </div>
          </DigitalAlbumPage>
        </DigitalAlbumFlipBook>
      </div>

      <p
        className={
          styles.hint
        }
      >
        Povuci kut stranice ili koristi strelice
      </p>
    </main>
  );
}