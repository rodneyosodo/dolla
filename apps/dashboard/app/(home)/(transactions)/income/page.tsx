"use client";

import { SidebarInset } from "@workspace/ui/components/sidebar";
import { useEffect, useState } from "react";
import { CreateIncomeDialog } from "@/components/create-income-dialog";
import NavHeader from "@/components/nav-header";
import { UploadStatementDialog } from "@/components/upload-statement-dialog";
import { getIncomes, IncomeResponse } from "@/lib/api";
import { createColumns } from "./components/columns";
import { DataTable } from "./components/data-table";

export default function Page() {
  const [response, setResponse] = useState<IncomeResponse>({
    offset: 0,
    limit: 100,
    total: 0,
    incomes: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const data = await getIncomes();
      setResponse(data);
    } catch (error) {
      console.error("Failed to fetch incomes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  console.log("Incomes response:", response);

  return (
    <SidebarInset>
      <NavHeader
        parent={{ title: "Transactions", url: "#" }}
        child={{ title: "Incomes" }}
      />
      <div className="flex flex-col gap-6 mx-auto p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Incomes</h2>
            <p className="text-muted-foreground">
              Here's a list of all your income transactions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreateIncomeDialog onIncomeCreated={fetchIncomes} />
            <UploadStatementDialog onUploadComplete={fetchIncomes} />
          </div>
        </div>
        <div className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading incomes...</div>
            </div>
          ) : (
            <DataTable
              data={response.incomes}
              columns={createColumns(fetchIncomes)}
            />
          )}
        </div>
      </div>
    </SidebarInset>
  );
}
