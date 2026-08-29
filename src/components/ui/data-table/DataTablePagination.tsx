"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Button,
} from "@/components/ui/button";


/* ==========================================================================
   Types
========================================================================== */

interface DataTablePaginationProps {
  page:
    number;

  totalPages:
    number;

  onPageChange: (
    page: number
  ) => void;
}


/* ==========================================================================
   Data Table Pagination
========================================================================== */

export default function DataTablePagination({
  page,
  totalPages,
  onPageChange,
}: DataTablePaginationProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Common.pagination"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const isFirstPage =
    page <= 1;

  const isLastPage =
    page >= totalPages;


  /* ==========================================================================
     Hidden
  ========================================================================== */

  if (totalPages <= 1) {
    return null;
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="text-sm text-muted-foreground">
        {t(
          "page"
        )}{" "}
        <span className="font-semibold text-foreground">
          {page}
        </span>{" "}
        {t(
          "of"
        )}{" "}
        <span className="font-semibold text-foreground">
          {totalPages}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={
            isFirstPage
          }
          aria-label={
            t(
              "previous"
            )
          }
          onClick={() =>
            onPageChange(
              page - 1
            )
          }
        >
          <ChevronLeft
            className="size-4"
            aria-hidden="true"
          />

          <span className="hidden sm:inline">
            {t(
              "previous"
            )}
          </span>
        </Button>

        <div
          className="
            min-w-14
            rounded-md
            border
            border-border
            bg-muted/40
            px-3
            py-1
            text-center
            text-sm
            font-medium
          "
        >
          {page} / {totalPages}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={
            isLastPage
          }
          aria-label={
            t(
              "next"
            )
          }
          onClick={() =>
            onPageChange(
              page + 1
            )
          }
        >
          <span className="hidden sm:inline">
            {t(
              "next"
            )}
          </span>

          <ChevronRight
            className="size-4"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  );
}