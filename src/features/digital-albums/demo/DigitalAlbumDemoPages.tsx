import DigitalAlbumPage
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumPage/DigitalAlbumPage";

import styles
  from "./DigitalAlbumDemo.module.css";


/* ==========================================================================
   Demo Photos
========================================================================== */

const photos = {
  couple:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=90",

  table:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=90",

  rings:
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=90",

  celebration:
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=90",
};


/* ==========================================================================
   Digital Album Demo Pages
========================================================================== */

export const digitalAlbumDemoPages = [
  /* ==========================================================================
     Front Cover
  ========================================================================== */

  <DigitalAlbumPage
    key="front-cover"
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
  </DigitalAlbumPage>,


  /* ==========================================================================
     Page 1 — Intro
  ========================================================================== */

  <DigitalAlbumPage
    key="page-1"
  >
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
      01
    </span>
  </DigitalAlbumPage>,


  /* ==========================================================================
     Page 2 — Full Photo
  ========================================================================== */

  <DigitalAlbumPage
    key="page-2"
  >
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
          Početak našeg dana
        </p>
      </div>
    </div>
  </DigitalAlbumPage>,


  /* ==========================================================================
     Page 3 — Details
  ========================================================================== */

  <DigitalAlbumPage
    key="page-3"
  >
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
          DETALJI
        </span>

        <h2>
          Male stvari
          <br />
          koje pamtimo
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
        Svaki detalj tog dana
        postao je dio naše priče.
      </p>
    </div>

    <span
      className={
        styles.pageNumber
      }
    >
      03
    </span>
  </DigitalAlbumPage>,


  /* ==========================================================================
     Page 4 — Ceremony
  ========================================================================== */

  <DigitalAlbumPage
    key="page-4"
  >
    <div
      className={
        styles.fullPhoto
      }
    >
      <img
        src={
          photos.celebration
        }
        alt=""
      />

      <div
        className={
          styles.photoCaption
        }
      >
        <span>
          04
        </span>

        <p>
          Trenutak koji smo čekali
        </p>
      </div>
    </div>
  </DigitalAlbumPage>,


  /* ==========================================================================
     Page 5 — Story
  ========================================================================== */

  <DigitalAlbumPage
    key="page-5"
  >
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
        ZAJEDNO
      </span>

      <h2>
        Rekli smo
        <br />
        da.
      </h2>

      <div
        className={
          styles.divider
        }
      />

      <p
        className={
          styles.quote
        }
      >
        I od tog trenutka
        <br />
        počinje naše zauvijek.
      </p>
    </div>

    <span
      className={
        styles.pageNumber
      }
    >
      05
    </span>
  </DigitalAlbumPage>,


  /* ==========================================================================
     Page 6 — Couple
  ========================================================================== */

  <DigitalAlbumPage
    key="page-6"
  >
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
          06
        </span>

        <p>
          Samo nas dvoje
        </p>
      </div>
    </div>
  </DigitalAlbumPage>,


  /* ==========================================================================
     Page 7 — Editorial
  ========================================================================== */

  <DigitalAlbumPage
    key="page-7"
  >
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
          LJUBAV
        </span>

        <h2>
          Trenuci
          <br />
          između svega
        </h2>
      </div>

      <img
        src={
          photos.couple
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
        Nisu nam ostale samo fotografije.
        Ostao nam je osjećaj tog dana.
      </p>
    </div>

    <span
      className={
        styles.pageNumber
      }
    >
      07
    </span>
  </DigitalAlbumPage>,


  /* ==========================================================================
     Page 8 — Rings
  ========================================================================== */

  <DigitalAlbumPage
    key="page-8"
  >
    <div
      className={
        styles.fullPhoto
      }
    >
      <img
        src={
          photos.rings
        }
        alt=""
      />

      <div
        className={
          styles.photoCaption
        }
      >
        <span>
          08
        </span>

        <p>
          Zauvijek počinje ovdje
        </p>
      </div>
    </div>
  </DigitalAlbumPage>,


  /* ==========================================================================
     Page 9 — Family & Friends
  ========================================================================== */

  <DigitalAlbumPage
    key="page-9"
  >
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
          09
        </span>

        <h2>
          Obitelj
          <br />
          i prijatelji
        </h2>
      </div>
    </div>
  </DigitalAlbumPage>,


  /* ==========================================================================
     Page 10 — Celebration
  ========================================================================== */

  <DigitalAlbumPage
    key="page-10"
  >
    <div
      className={
        styles.fullPhoto
      }
    >
      <img
        src={
          photos.celebration
        }
        alt=""
      />

      <div
        className={
          styles.photoCaption
        }
      >
        <span>
          10
        </span>

        <p>
          Slavlje do kasno u noć
        </p>
      </div>
    </div>
  </DigitalAlbumPage>,


  /* ==========================================================================
     Page 11 — Final Story
  ========================================================================== */

  <DigitalAlbumPage
    key="page-11"
  >
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
        NAŠA PRIČA
      </span>

      <h2>
        Ovo je tek
        <br />
        početak.
      </h2>

      <div
        className={
          styles.divider
        }
      />

      <p
        className={
          styles.quote
        }
      >
        Najljepše uspomene
        <br />
        tek ćemo stvoriti.
      </p>
    </div>

    <span
      className={
        styles.pageNumber
      }
    >
      11
    </span>
  </DigitalAlbumPage>,


  /* ==========================================================================
     Page 12 — Final Photo
  ========================================================================== */

  <DigitalAlbumPage
    key="page-12"
  >
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
          12
        </span>

        <p>
          Zauvijek zajedno
        </p>
      </div>
    </div>
  </DigitalAlbumPage>,


  /* ==========================================================================
     Inside Back Cover
  ========================================================================== */

  <DigitalAlbumPage
    key="inside-back-cover"
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
  </DigitalAlbumPage>,


  /* ==========================================================================
     Final Memory
  ========================================================================== */

  <DigitalAlbumPage
    key="final-memory"
  >
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
          ♥
        </span>

        <p>
          Kraj jednog dana.
          <br />
          Početak svega ostalog.
        </p>
      </div>
    </div>
  </DigitalAlbumPage>,


  /* ==========================================================================
     Outside Back Cover
  ========================================================================== */

  <DigitalAlbumPage
    key="outside-back-cover"
    className={
      styles.outsideBackCover
    }
  >
    <div>
      <span
        className={
          styles.smallLabel
        }
      >
        ANA & MARKO
      </span>

      <div
        className={
          styles.divider
        }
      />

      <span
        className={
          styles.date
        }
      >
        15 · 06 · 2027
      </span>
    </div>
  </DigitalAlbumPage>,
];