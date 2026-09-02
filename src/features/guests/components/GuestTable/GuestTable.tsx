"use client";

import {
  Users,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Button,
} from "@/components/ui/button";

import {
  DataTable,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data-table";

import GuestRow
  from "../GuestRow/GuestRow";

import type {
  EventGuest,
  GuestGroup,
} from "../../types/guest.types";

import styles
  from "./GuestTable.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface GuestTableProps {
  guests:
    EventGuest[];

  allGuests:
    EventGuest[];

  groups:
    GuestGroup[];

  onAddGuest?:
    () => void;

  onEditGuest?:
    (
      guest: EventGuest
    ) => void;
}


/* ==========================================================================
   Guest Table
========================================================================== */

export default function GuestTable({
  guests,
  allGuests,
  groups,
  onAddGuest,
  onEditGuest,
}: GuestTableProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Guests.table"
    );


  /* ==========================================================================
     Maps
  ========================================================================== */

  const groupMap =
    new Map(
      groups.map(
        (group) => [
          group.id,
          group,
        ]
      )
    );

const guestMap =
  new Map(
    allGuests.map(
      (guest) => [
        guest.id,
        guest,
      ]
    )
  );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <DataTable
      data={
        guests
      }
      emptyState={{
        icon:
          Users,

        title:
          t(
            "emptyTitle"
          ),

        description:
          t(
            "emptyDescription"
          ),

        action:
          onAddGuest ? (
            <Button
              type="button"
              onClick={
                onAddGuest
              }
            >
              {t(
                "addGuest"
              )}
            </Button>
          ) : undefined,
      }}
    >
      <Table
        className={
          styles.table
        }
      >
        <TableHeader
          className={
            styles.header
          }
        >
          <TableRow>
            <TableHead
              scope="col"
              className={
                styles.guestColumn
              }
            >
              {t(
                "guest"
              )}
            </TableHead>

            <TableHead
              scope="col"
              className={
                styles.contactColumn
              }
            >
              {t(
                "contact"
              )}
            </TableHead>

            <TableHead
              scope="col"
              className={
                styles.groupColumn
              }
            >
              {t(
                "group"
              )}
            </TableHead>

            <TableHead
              scope="col"
              className={
                styles.primaryGuestColumn
              }
            >
              {t(
                "primaryGuest"
              )}
            </TableHead>

            <TableHead
              scope="col"
              className={
                styles.notesColumn
              }
            >
              {t(
                "notes"
              )}
            </TableHead>

            <TableHead
              scope="col"
              className={
                styles.actionsColumn
              }
            >
              <span
                className="sr-only"
              >
                {t(
                  "actions"
                )}
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>


        <TableBody
          className={
            styles.body
          }
        >
          {guests.map(
            (guest) => (
              <GuestRow
                key={
                  guest.id
                }
                guest={
                  guest
                }
                group={
                  guest.group_id
                    ? groupMap.get(
                        guest.group_id
                      ) ?? null
                    : null
                }
                primaryGuest={
                  guest.primary_guest_id
                    ? guestMap.get(
                        guest.primary_guest_id
                      ) ?? null
                    : null
                }
                onEdit={
                  onEditGuest
                    ? () =>
                        onEditGuest(
                          guest
                        )
                    : undefined
                }
              />
            )
          )}
        </TableBody>
      </Table>
    </DataTable>
  );
}