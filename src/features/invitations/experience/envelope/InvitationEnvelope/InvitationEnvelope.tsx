"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import type {
  InvitationCardOrientation,
} from "@/features/invitations/cards/utils/invitationCard.utils";

import {
  invitationEnvelopeRegistry,
} from "@/features/invitations/experience/envelope/registry/invitationEnvelopeRegistry";

import "./styles/InvitationEnvelope.css";


/* ==========================================================================
   Types
========================================================================== */

type InvitationEnvelopeState =
  | "closed"
  | "opening"
  | "presented";

interface InvitationEnvelopeProps {
  children:
    ReactNode;

  actions?:
    ReactNode;

  envelopeId:
    keyof typeof invitationEnvelopeRegistry;

  cardOrientation:
    InvitationCardOrientation;

  initialState?:
    InvitationEnvelopeState;

  onPresented?:
    () => void;
}


/* ==========================================================================
   Constants
========================================================================== */

const PRESENT_DELAY =
  3600;


/* ==========================================================================
   Invitation Envelope
========================================================================== */

export default function InvitationEnvelope({
  children,
  actions,
  envelopeId,
  cardOrientation,
  initialState = "closed",
  onPresented,
}: InvitationEnvelopeProps) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    state,
    setState,
  ] =
    useState<InvitationEnvelopeState>(
      initialState
    );

  const [
    isReady,
    setIsReady,
  ] =
    useState(false);

  const presentTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );


  /* ==========================================================================
     Envelope
  ========================================================================== */

  const envelope =
    invitationEnvelopeRegistry[
      envelopeId
    ];


  /* ==========================================================================
     Preload Envelope Assets
  ========================================================================== */

  useEffect(
    () => {
      let isActive =
        true;

      setIsReady(
        false
      );

      const sources = [
        envelope.back,
        envelope.front,
        envelope.flap,
        envelope.liner,
      ];

      const preloadImage = (
        source: string
      ) =>
        new Promise<void>(
          (resolve) => {
            const image =
              new Image();

            image.onload =
              () => {
                resolve();
              };

            image.onerror =
              () => {
                resolve();
              };

            image.src =
              source;

            if (
              image.complete
            ) {
              resolve();
            }
          }
        );

      Promise.all(
        sources.map(
          preloadImage
        )
      ).then(
        () => {
          if (
            !isActive
          ) {
            return;
          }

          setIsReady(
            true
          );
        }
      );

      return () => {
        isActive =
          false;
      };
    },
    [
      envelope.back,
      envelope.front,
      envelope.flap,
      envelope.liner,
    ]
  );


  /* ==========================================================================
     Cleanup
  ========================================================================== */

  useEffect(
    () => {
      return () => {
        if (
          presentTimeoutRef.current
        ) {
          clearTimeout(
            presentTimeoutRef.current
          );
        }
      };
    },
    []
  );


  /* ==========================================================================
     Open
  ========================================================================== */

  function handleOpen() {
    if (
      !isReady ||
      state !==
        "closed"
    ) {
      return;
    }

    setState(
      "opening"
    );

    presentTimeoutRef.current =
      setTimeout(
        () => {
          setState(
            "presented"
          );

          onPresented?.();
        },
        PRESENT_DELAY
      );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="invitation-envelope-stage"
      data-invitation-envelope
      data-envelope={
        envelopeId
      }
      data-card-orientation={
        cardOrientation
      }
      data-state={
        state
      }
      data-ready={
        isReady
          ? "true"
          : "false"
      }
    >
      {/* ====================================================================
          Envelope
      ==================================================================== */}

      <div
        className="invitation-envelope"
      >
        {/* ==================================================================
            Back
        ================================================================== */}

        <img
          className="
            invitation-envelope__asset
            invitation-envelope__back
          "
          src={
            envelope.back
          }
          alt=""
          aria-hidden="true"
          draggable={false}
        />


        {/* ==================================================================
            Card Track
        ================================================================== */}

        <div
          className="invitation-envelope__card-track"
        >
          <div
            className="invitation-envelope__card"
          >
            {children}
          </div>


          {/* ================================================================
              Actions
          ================================================================ */}

          {state === "presented" &&
            actions && (
              <div
                className="invitation-envelope__actions"
              >
                {actions}
              </div>
            )}
        </div>


        {/* ==================================================================
            Front
        ================================================================== */}

        <img
          className="
            invitation-envelope__asset
            invitation-envelope__front
          "
          src={
            envelope.front
          }
          alt=""
          aria-hidden="true"
          draggable={false}
        />


        {/* ==================================================================
            Flap Trigger
        ================================================================== */}

        <button
          type="button"
          className="invitation-envelope__flap-trigger"
          onClick={
            handleOpen
          }
          aria-label="Otvori pozivnicu"
          aria-expanded={
            state !==
            "closed"
          }
          disabled={
            !isReady
          }
        >
          <span
            className="invitation-envelope__flap-hinge"
          >
            <span
              className="invitation-envelope__flap-sheet"
            >
              <img
                className="
                  invitation-envelope__flap-face
                  invitation-envelope__flap-face--front
                "
                src={
                  envelope.flap
                }
                alt=""
                aria-hidden="true"
                draggable={false}
              />

              <img
                className="
                  invitation-envelope__flap-face
                  invitation-envelope__flap-face--back
                "
                src={
                  envelope.liner
                }
                alt=""
                aria-hidden="true"
                draggable={false}
              />
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}