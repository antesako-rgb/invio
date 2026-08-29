"use client";

import type {
  ReactNode,
} from "react";

import type {
  LucideIcon,
} from "lucide-react";

import {
  EmptyState,
} from "@/components/ui/empty-state/EmptyState";

import {
  cn,
} from "@/lib/utils/utils";

import DataTableLoading
  from "./DataTableLoading";


/* ==========================================================================
   Types
========================================================================== */

interface DataTableEmptyState {
  icon:
    LucideIcon;

  title:
    string;

  description:
    string;

  action?:
    ReactNode;
}


interface DataTableProps {
  data:
    unknown[];

  children:
    ReactNode;

  loading?:
    boolean;

  loadingRows?:
    number;

  loadingColumns?:
    number;

  className?:
    string;

  size?:
    | "default"
    | "medium"
    | "narrow";

  title?:
    ReactNode;

  description?:
    ReactNode;

  actions?:
    ReactNode;

  toolbar?:
    ReactNode;

  pagination?:
    ReactNode;

  emptyState?:
    DataTableEmptyState;
}


/* ==========================================================================
   Data Table
========================================================================== */

export default function DataTable({
  data,
  children,
  loading = false,
  loadingRows = 5,
  loadingColumns = 5,
  className,
  size = "default",
  title,
  description,
  actions,
  toolbar,
  pagination,
  emptyState,
}: DataTableProps) {


  /* ==========================================================================
     Loading
  ========================================================================== */

  if (loading) {
    return (
      <DataTableLoading
        rows={
          loadingRows
        }
        columns={
          loadingColumns
        }
      />
    );
  }


  /* ==========================================================================
     Empty State
  ========================================================================== */

  if (
    data.length === 0 &&
    emptyState
  ) {
    return (
      <EmptyState
        icon={
          emptyState.icon
        }
        title={
          emptyState.title
        }
        description={
          emptyState.description
        }
        action={
          emptyState.action
        }
      />
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <section
      className={cn(
        "w-full space-y-4",

        size === "medium" &&
          "mx-auto max-w-6xl",

        size === "narrow" &&
          "mx-auto max-w-4xl",

        className
      )}
    >
      {(title ||
        description ||
        actions) && (
        <header
          className="
            flex
            flex-col
            gap-4

            sm:flex-row
            sm:items-start
            sm:justify-between
          "
        >
          <div
            className="
              min-w-0
              space-y-1
            "
          >
            {title && (
              <h3 className="text-base font-semibold">
                {title}
              </h3>
            )}

            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>


          {actions && (
            <div
              className="
                flex
                shrink-0
                flex-wrap
                items-center
                gap-2
              "
            >
              {actions}
            </div>
          )}
        </header>
      )}


      {toolbar}


      {children}


      {pagination}
    </section>
  );
}