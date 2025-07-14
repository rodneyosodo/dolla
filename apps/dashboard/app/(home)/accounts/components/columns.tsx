"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Account } from "@/types/schema";
import { DataTableRowActions } from "./data-table-row-actions";

export const createColumns = (
  onAccountUpdated?: () => void,
): ColumnDef<Account>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate font-medium">
            {row.getValue("name")}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "accountType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account Type" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <Badge variant="outline">
            {row.getValue("accountType") || "Unknown"}
          </Badge>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "balance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Balance" />
    ),
    cell: ({ row }) => {
      const balance = parseFloat(row.getValue("balance"));
      const currency = row.original.currency || "KES";
      const formatted = new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(balance);

      return (
        <div
          className={`font-medium ${balance >= 0 ? "text-green-600" : "text-red-600"}`}
        >
          {formatted}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "currency",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Currency" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <Badge variant="secondary">{row.getValue("currency") || "KES"}</Badge>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[300px] truncate text-muted-foreground">
            {description || "No description"}
          </span>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "dateCreated",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("dateCreated") as string;
      if (!date) return <div className="text-muted-foreground">-</div>;

      const formatted = new Date(date).toLocaleDateString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return <div className="text-sm">{formatted}</div>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions row={row} onAccountUpdated={onAccountUpdated} />
    ),
  },
];

export const columns = createColumns();
