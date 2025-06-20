import { SidebarInset } from "@workspace/ui/components/sidebar";
import { promises as fs } from "fs";
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
      <div className="container mx-auto p-10">
        <DataTable data={expenses} columns={columns} />
      </div>
    </SidebarInset>
  );
}
