"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";
import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

export { createColumnHelper };
export type { ColumnDef };

interface DataTableProps<TData extends Record<string, unknown>> {
  columns: ColumnDef<TData>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  emptyMessage?: string;
  className?: string;
  pageSize?: number;
  /** Server-side pagination */
  manualPagination?: boolean;
  pageCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<TData extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data found",
  className,
  pageSize,
  manualPagination,
  pageCount: externalPageCount,
  currentPage: externalPage,
  onPageChange,
}: Readonly<DataTableProps<TData>>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize ?? 50,
  });
  const isMobile = useMediaQuery("(max-width: 639px)");

  const pagination = manualPagination
    ? { pageIndex: externalPage ?? 0, pageSize: pageSize ?? 50 }
    : internalPagination;

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: manualPagination
      ? (updater) => {
          const next = typeof updater === "function" ? updater(pagination) : updater;
          onPageChange?.(next.pageIndex);
        }
      : setInternalPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(pageSize && !manualPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    ...(manualPagination ? { manualPagination: true, pageCount: externalPageCount } : {}),
  });

  const rows = table.getRowModel().rows;
  const headerGroup = table.getHeaderGroups()[0];
  const totalPages = manualPagination ? (externalPageCount ?? 1) : (pageSize ? table.getPageCount() : 1);

  if (isMobile) {
    if (rows.length === 0) {
      return (
        <div className={cn("px-4 py-12 text-center text-[14px] text-(--muted)", className)}>
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className={cn("space-y-3", className)}>
        {rows.map((row) => {
          const cells = row.getVisibleCells();
          const fieldCells = cells.filter((cell) => {
            const h = cell.column.columnDef.header;
            return typeof h !== "string" || h !== "" || cell.column.id !== "actions";
          });
          const actionCells = cells.filter((cell) => {
            const h = cell.column.columnDef.header;
            return typeof h === "string" && h === "" && cell.column.id === "actions";
          });

          return (
            <div
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              className={cn(
                "bg-(--surface) border border-(--border) rounded-(--r-card) p-3",
                onRowClick && "cursor-pointer hover:bg-(--bg)"
              )}
            >
              <div className="divide-y divide-(--border)">
                {fieldCells.map((cell) => {
                  const h = cell.column.columnDef.header;
                  const label = typeof h === "string" ? h : cell.column.id;
                  return (
                    <div key={cell.id} className="flex items-center justify-between gap-3 py-1.5 first:pt-0 last:pb-0">
                      <span className="text-[12px] font-medium text-(--muted) uppercase tracking-[0.5px] shrink-0">
                        {label}
                      </span>
                      <span className="text-[14px] text-(--text) text-right">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </span>
                    </div>
                  );
                })}
              </div>
              {actionCells.length > 0 && (
                <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t border-(--border)">
                  {actionCells.map((cell) => (
                    <span key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {pageSize && totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-3 text-[14px] text-(--muted)">
            <span>
              Page {pagination.pageIndex + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1 rounded-md hover:bg-(--bg) disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1 rounded-md hover:bg-(--bg) disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-(--border) bg-(--bg)">
            {headerGroup.headers.map((header) => {
              const sorted = header.column.getIsSorted();
              const sortable = header.column.getCanSort();
              return (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={cn(
                    "text-left text-[12px] font-medium text-(--muted) uppercase tracking-[0.5px] px-4 py-2.5 select-none",
                    sortable && "cursor-pointer hover:text-(--text)"
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {sorted === "asc" ? (
                      <ChevronUp size={12} className="shrink-0" />
                    ) : sorted === "desc" ? (
                      <ChevronDown size={12} className="shrink-0" />
                    ) : null}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={headerGroup.headers.length}
                className="px-4 py-12 text-center text-[14px] text-(--muted)"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  "border-b border-(--border) last:border-0 transition-colors duration-100",
                  "odd:bg-(--surface) even:bg-(--bg)",
                  onRowClick && "cursor-pointer hover:!bg-(--bg)"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-[14px] text-(--text) align-middle"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pageSize && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-(--border) text-[14px] text-(--muted)">
          <span>
            Page {pagination.pageIndex + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 rounded-md hover:bg-(--bg) disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 rounded-md hover:bg-(--bg) disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
