"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Download, MoreHorizontal, Pen, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Account, accountSchema } from "@/types/schema";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { EditAccountDialog } from "./edit-account-dialog";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onAccountUpdated?: () => void;
}

export function DataTableRowActions<TData>({
  row,
  onAccountUpdated,
}: DataTableRowActionsProps<TData>) {
  const account = accountSchema.parse(row.original) as Account;
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleExport = () => {
    // Simple CSV export for the single account
    const csvData = [
      [
        "Name",
        "Account Type",
        "Balance",
        "Currency",
        "Description",
        "Created Date",
      ],
      [
        account.name,
        account.accountType,
        account.balance.toString(),
        account.currency || "KES",
        account.description || "",
        account.dateCreated || "",
      ],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `account-${account.name}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast("Export successful", {
      description: "Account has been exported to CSV file.",
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            className="text-blue-600 hover:bg-blue-50"
            onClick={() => setEditDialogOpen(true)}
          >
            <Pen className="text-blue-600" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-indigo-600 hover:bg-indigo-50"
            onClick={handleExport}
          >
            <Download className="text-indigo-600" />
            Export
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 hover:bg-red-50"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="text-red-600" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditAccountDialog
        account={account}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onAccountUpdated={onAccountUpdated}
      />

      <DeleteAccountDialog
        account={account}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onAccountDeleted={onAccountUpdated}
      />
    </>
  );
}
