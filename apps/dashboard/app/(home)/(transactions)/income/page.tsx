import { Button } from "@workspace/ui/components/button";
import { SidebarInset } from "@workspace/ui/components/sidebar";
import { promises as fs } from "fs";
import { CirclePlus } from "lucide-react";
import path from "path";
import { z } from "zod";
import NavHeader from "@/components/nav-header";
import { incomeSchema } from "@/types/schema";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

async function getIncomes() {
  const data = await fs.readFile(
    path.join(
      process.cwd(),
      "app/(home)/(transactions)/income/data/transactions.json",
    ),
  );

  const incomes = JSON.parse(data.toString());

  return z.array(incomeSchema).parse(incomes);
}

export default async function Page() {
  const incomes = await getIncomes();

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
            <Button variant="outline">
              <CirclePlus className="h-4 w-4 mr-2" />
              Create New Income Transaction
            </Button>
            <Button variant="outline">
              <CirclePlus className="h-4 w-4 mr-2" />
              Upload Transactions
            </Button>
          </div>
        </div>
        <div className="p-0">
          <DataTable data={incomes} columns={columns} />
        </div>
      </div>
    </SidebarInset>
  );
}
