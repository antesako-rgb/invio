"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  invitationEnvelopeRegistry,
} from "@/features/invitations/experience/envelope/registry/invitationEnvelopeRegistry";

import "./styles/InvitationEnvelope.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationEnvelopeProps {
  children:
    ReactNode;

  envelopeId:
    keyof typeof invitationEnvelopeRegistry;
}

type InvitationEnvelopeState =
  | "closed"
  | "opening"
  | "presented";


/* ==========================================================================
   Constants
========================================================================== */

const PRESENT_DELAY =
  3650;


/* ==========================================================================
   Invitation Envelope
========================================================================== */

export default function InvitationEnvelope({
  children,
  envelopeId,
}: InvitationEnvelopeProps) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    state,
    setState,
  ] =
    useState<InvitationEnvelopeState>(
      "closed"
    );

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
     Cleanup
  ========================================================================== */

  useEffect(() => {
    return () => {
      if (
        presentTimeoutRef.current
      ) {
        clearTimeout(
          presentTimeoutRef.current
        );
      }
    };
  }, []);


  /* ==========================================================================
     Open
  ========================================================================== */

  function handleOpen() {
    if (
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
      data-state={
        state
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
          {/* ================================================================
              Card
          ================================================================ */}

          <div
            className="invitation-envelope__card"
          >
            {children}
          </div>
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
        >
          {/* ================================================================
              Flap Hinge
          ================================================================ */}

          <span
            className="invitation-envelope__flap-hinge"
          >
            {/* ==============================================================
                Flap Sheet
            ============================================================== */}

            <span
              className="invitation-envelope__flap-sheet"
            >
              {/* ============================================================
                  Front Face
              ============================================================ */}

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


              {/* ============================================================
                  Back Face
              ============================================================ */}

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