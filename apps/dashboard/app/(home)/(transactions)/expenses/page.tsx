import { Button } from "@workspace/ui/components/button";
import { SidebarInset } from "@workspace/ui/components/sidebar";
import { promises as fs } from "fs";
import { CirclePlus } from "lucide-react";
import path from "path";
import { z } from "zod";
import NavHeader from "@/components/nav-header";
import { expenseSchema } from "@/types/schema";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

async function getExpenses() {
  const data = await fs.readFile(
    path.join(
      process.cwd(),
      "app/(home)/(transactions)/expenses/data/transactions.json",
    ),
  );

  const expenses = JSON.parse(data.toString());

  return z.array(expenseSchema).parse(expenses);
}

export default async function Page() {
  const expenses = await getExpenses();

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
            <Button variant="outline">
              <CirclePlus className="h-4 w-4 mr-2" />
              Create New Expense Transaction
            </Button>
            <Button variant="outline">
              <CirclePlus className="h-4 w-4 mr-2" />
              Upload Transactions
            </Button>
          </div>
        </div>
        <div className="p-0">
          <DataTable data={expenses} columns={columns} />
        </div>
      </div>
    </SidebarInset>
  );
}
