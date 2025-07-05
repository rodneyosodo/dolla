"use client";

import { SidebarInset } from "@workspace/ui/components/sidebar";
import { useEffect, useState } from "react";
import { CreateExpenseDialog } from "@/components/create-expense-dialog";
import NavHeader from "@/components/nav-header";
import { UploadStatementDialog } from "@/components/upload-statement-dialog";
import { ExpenseResponse, getExpenses } from "@/lib/api";
import { createColumns } from "./components/columns";
import { DataTable } from "./components/data-table";

export default function Page() {
  const [response, setResponse] = useState<ExpenseResponse>({
    offset: 0,
    limit: 10,
    total: 0,
    expenses: [],
  });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchExpenses = async (offset?: number, limit?: number) => {
    try {
      setLoading(true);
      const data = await getExpenses(
        offset ?? pagination.pageIndex * pagination.pageSize,
        limit ?? pagination.pageSize,
      );
      setResponse(data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setPagination(newPagination);
    fetchExpenses(
      newPagination.pageIndex * newPagination.pageSize,
      newPagination.pageSize,
    );
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <SidebarInset>
      <NavHeader
        parent={{ title: "Transactions", url: "#" }}
        child={{ title: "Expenses" }}
      />
      <div className="flex flex-col gap-6 mx-auto p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
            <p className="text-muted-foreground">
              Where does your money go? Here's a list of all your expense
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreateExpenseDialog onExpenseCreated={fetchExpenses} />
            <UploadStatementDialog onUploadComplete={fetchExpenses} />
          </div>
        </div>
        <div className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading expenses...</div>
            </div>
          ) : (
            <DataTable
              data={response.expenses}
              columns={createColumns(fetchExpenses)}
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
