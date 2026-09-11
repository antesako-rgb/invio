"use client";

import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import InvitationLocationMap
  from "@/features/invitations/components/invitation-experience/details/InvitationDetailsView/InvitationLocationMap/InvitationLocationMap";

import type {
  EventExperienceRenderData,
} from "@/features/invitations/types/eventExperienceRenderer.types";

import "./InvitationDetailsView.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationDetailsViewProps {
  data:
    EventExperienceRenderData;

  onBack?:
    () => void;
}


/* ==========================================================================
   Invitation Details View
========================================================================== */

export default function InvitationDetailsView({
  data,
  onBack,
}: InvitationDetailsViewProps) {
  const t =
    useTranslations(
      "Invitations.experience.details"
    );

  const title =
    data.content.hero.title;

  const locationName =
    data.content.location.name;

  const locationAddress =
    data.content.location.address;


  /* ==========================================================================
     Navigate
  ========================================================================== */

  function handleNavigate() {
    const destination =
      [
        locationName,
        locationAddress,
      ]
        .filter(
          Boolean
        )
        .join(
          ", "
        );

    if (!destination) {
      return;
    }

    const url =
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        destination
      )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="invitation-details-view"
      data-invitation-details-view
    >
      <div
        className="invitation-details-view__shell"
      >
        {/* ==================================================================
            Header
        ================================================================== */}

        <header
          className="invitation-details-view__header"
        >
          {onBack
            ? (
              <button
                type="button"
                className="invitation-details-view__back"
                onClick={
                  onBack
                }
                aria-label={
                  t(
                    "back"
                  )
                }
              >
                <ArrowLeft
                  aria-hidden="true"
                />
              </button>
            )
            : (
              <div
                className="invitation-details-view__header-spacer"
                aria-hidden="true"
              />
            )}

          {title && (
            <div
              className="invitation-details-view__event"
            >
              {title}
            </div>
          )}

          <div
            className="invitation-details-view__header-spacer"
            aria-hidden="true"
          />
        </header>


        {/* ==================================================================
            Intro
        ================================================================== */}

        <div
          className="invitation-details-view__intro"
        >
          <h1
            className="invitation-details-view__title"
          >
            {t(
              "title"
            )}
          </h1>

          <span
            className="invitation-details-view__ornament"
            aria-hidden="true"
          >
            ❧
          </span>
        </div>


        {/* ==================================================================
            Content
        ================================================================== */}

        <div
          className="invitation-details-view__content"
        >
          {/* ================================================================
              Program
          ================================================================ */}

          <section
            className="invitation-details-view__section"
          >
            <div
              className="invitation-details-view__section-header"
            >
              <div
                className="invitation-details-view__section-heading"
              >
                <CalendarDays
                  className="invitation-details-view__section-icon"
                  aria-hidden="true"
                />

                <h2>
                  {t(
                    "program"
                  )}
                </h2>
              </div>

              <ChevronRight
                className="invitation-details-view__chevron"
                aria-hidden="true"
              />
            </div>

            <div
              className="invitation-details-view__section-body"
            >
              <p
                className="invitation-details-view__empty"
              >
                {t(
                  "programEmpty"
                )}
              </p>
            </div>
          </section>


          {/* ================================================================
              Location
          ================================================================ */}

          {(
            locationName ||
            locationAddress
          ) ? (
            <InvitationLocationMap
              name={
                locationName
              }
              address={
                locationAddress
              }
              onNavigate={
                handleNavigate
              }
            />
          ) : (
            <section
              className="invitation-details-view__section"
            >
              <div
                className="invitation-details-view__section-header"
              >
                <div
                  className="invitation-details-view__section-heading"
                >
                  <h2>
                    {t(
                      "location"
                    )}
                  </h2>
                </div>
              </div>

              <div
                className="invitation-details-view__section-body"
              >
                <p
                  className="invitation-details-view__empty"
                >
                  {t(
                    "locationEmpty"
                  )}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}