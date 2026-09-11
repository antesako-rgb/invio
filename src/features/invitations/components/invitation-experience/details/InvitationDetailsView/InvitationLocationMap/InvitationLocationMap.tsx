import {
  MapPin,
  Navigation,
} from "lucide-react";

import "./InvitationLocationMap.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationLocationMapProps {
  name:
    string | null;

  address:
    string | null;

  onNavigate?:
    () => void;
}


/* ==========================================================================
   Invitation Location Map
========================================================================== */

export default function InvitationLocationMap({
  name,
  address,
  onNavigate,
}: InvitationLocationMapProps) {
  if (
    !name &&
    !address
  ) {
    return null;
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="invitation-location-map"
    >
      {/* ====================================================================
          Information
      ==================================================================== */}

      <div
        className="invitation-location-map__information"
      >
        <div
          className="invitation-location-map__icon"
          aria-hidden="true"
        >
          <MapPin />
        </div>


        <div
          className="invitation-location-map__details"
        >
          {name && (
            <strong
              className="invitation-location-map__name"
            >
              {name}
            </strong>
          )}

          {address && (
            <span
              className="invitation-location-map__address"
            >
              {address}
            </span>
          )}
        </div>


        {onNavigate && (
          <button
            type="button"
            className="invitation-location-map__navigate"
            onClick={
              onNavigate
            }
          >
            <Navigation
              aria-hidden="true"
            />

            <span>
              Navigiraj
            </span>
          </button>
        )}
      </div>


      {/* ====================================================================
          Map
      ==================================================================== */}

      <div
        className="invitation-location-map__map"
        aria-hidden="true"
      >
        <div
          className="invitation-location-map__map-placeholder"
        />

        <div
          className="invitation-location-map__marker"
        >
          <MapPin />

          {name && (
            <span>
              {name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}