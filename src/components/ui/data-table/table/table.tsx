import * as React from "react";

import {
  cn,
} from "@/lib/utils/utils";


/* ==========================================================================
   Types
========================================================================== */

type TablePadding =
  | "default"
  | "compact";


/* ==========================================================================
   Table
========================================================================== */

function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div
      data-slot="table-container"
      className="
        w-full
        overflow-x-auto

        rounded-2xl
        border
        border-primary/20

        bg-card

        shadow-sm
        shadow-primary/5
      "
    >
      <table
        data-slot="table"
        className={cn(
          `
            w-full

            table-fixed
            border-collapse
            caption-bottom

            text-sm
          `,
          className
        )}
        {...props}
      />
    </div>
  );
}


/* ==========================================================================
   Table Header
========================================================================== */

function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        `
          border-b
          border-primary/20

          bg-primary/10
        `,
        className
      )}
      {...props}
    />
  );
}


/* ==========================================================================
   Table Body
========================================================================== */

function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        `
          bg-card

          [&_tr:last-child]:border-0
        `,
        className
      )}
      {...props}
    />
  );
}


/* ==========================================================================
   Table Row
========================================================================== */
function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        `
          group

          border-b
          border-primary/10

          bg-card

          transition-colors
          duration-150
          ease-out

          even:bg-primary/[0.045]

          hover:bg-primary/[0.17]

          [&>td:first-child]:relative

          [&>td:first-child]:before:absolute
          [&>td:first-child]:before:inset-y-0
          [&>td:first-child]:before:left-0
          [&>td:first-child]:before:w-[3px]
          [&>td:first-child]:before:bg-primary
          [&>td:first-child]:before:opacity-0
          [&>td:first-child]:before:transition-opacity

          hover:[&>td:first-child]:before:opacity-100

          first:[&>td:first-child]:before:rounded-tl-2xl
          last:[&>td:first-child]:before:rounded-bl-2xl
        `,
        className
      )}
      {...props}
    />
  );
}


/* ==========================================================================
   Table Head
========================================================================== */

interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  padding?:
    TablePadding;
}

function TableHead({
  className,
  padding = "default",
  ...props
}: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        `
          py-5

          text-left
          align-middle

          whitespace-nowrap
          tabular-nums

          text-[12px]
          font-bold
          uppercase
          tracking-[0.08em]

          text-primary/80
        `,

        padding ===
          "default" &&
          "px-6",

        padding ===
          "compact" &&
          "px-3",

        className
      )}
      {...props}
    />
  );
}


/* ==========================================================================
   Table Cell
========================================================================== */

interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  padding?:
    TablePadding;
}

function TableCell({
  className,
  padding = "default",
  ...props
}: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        `
          py-4

          align-middle
          tabular-nums

          text-foreground
        `,

        padding ===
          "default" &&
          "px-6",

        padding ===
          "compact" &&
          "px-2.5",

        className
      )}
      {...props}
    />
  );
}


/* ==========================================================================
   Table Caption
========================================================================== */

function TableCaption({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        `
          py-4

          text-sm
          text-muted-foreground
        `,
        className
      )}
      {...props}
    />
  );
}


/* ==========================================================================
   Exports
========================================================================== */

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};