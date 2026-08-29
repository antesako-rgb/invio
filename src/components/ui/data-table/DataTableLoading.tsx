"use client";

import {
  Skeleton,
} from "@/components/ui/skeleton/Skeleton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data-table/table/table";


/* ==========================================================================
   Types
========================================================================== */

interface DataTableLoadingProps {
  rows?:
    number;

  columns?:
    number;
}


/* ==========================================================================
   Data Table Loading
========================================================================== */

export default function DataTableLoading({
  rows = 5,
  columns = 5,
}: DataTableLoadingProps) {
  /* ==========================================================================
     Skeleton Size
  ========================================================================== */

  const rowCount =
    Math.max(
      1,
      rows
    );

  const columnCount =
    Math.max(
      1,
      columns
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({
            length:
              columnCount,
          }).map(
            (_, index) => (
              <TableHead
                key={
                  index
                }
              >
                <Skeleton className="h-4 w-20" />
              </TableHead>
            )
          )}
        </TableRow>
      </TableHeader>

      <TableBody>
        {Array.from({
          length:
            rowCount,
        }).map(
          (_, rowIndex) => (
            <TableRow
              key={
                rowIndex
              }
            >
              {Array.from({
                length:
                  columnCount,
              }).map(
                (
                  _,
                  cellIndex
                ) => (
                  <TableCell
                    key={
                      cellIndex
                    }
                  >
                    <Skeleton className="h-4 w-full max-w-[180px]" />
                  </TableCell>
                )
              )}
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );
}