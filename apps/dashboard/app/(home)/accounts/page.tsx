"use client";

import { SidebarInset } from "@workspace/ui/components/sidebar";
import { useEffect, useState } from "react";
import NavHeader from "@/components/nav-header";
import { getAccounts } from "@/lib/api";
import { AccountResponse } from "@/types/schema";
import { createColumns } from "./components/columns";
import { CreateAccountDialog } from "./components/create-account-dialog";
import { DataTable } from "./components/data-table";

export default function Page() {
  const [response, setResponse] = useState<AccountResponse>({
    offset: 0,
    limit: 10,
    total: 0,
    accounts: [],
  });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchAccounts = async (offset?: number, limit?: number) => {
    try {
      setLoading(true);
      const data = await getAccounts(
        offset ?? pagination.pageIndex * pagination.pageSize,
        limit ?? pagination.pageSize,
      );
      setResponse(data);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setPagination(newPagination);
    fetchAccounts(
      newPagination.pageIndex * newPagination.pageSize,
      newPagination.pageSize,
    );
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <SidebarInset>
      <NavHeader parent={{ title: "Accounts", url: "/accounts" }} />
      <div className="flex flex-col gap-6 mx-auto p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
            <p className="text-muted-foreground">
              Manage your financial accounts and track balances across different
              accounts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreateAccountDialog onAccountCreated={fetchAccounts} />
          </div>
        </div>
        <div className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading accounts...</div>
            </div>
          ) : (
            <DataTable
              data={response.accounts}
              columns={createColumns(fetchAccounts)}
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
              pageCount={Math.ceil(response.total / pagination.pageSize)}
              totalCount={response.total}
            />
          )}
        </div>
      </div>
    </SidebarInset>
  );
}
