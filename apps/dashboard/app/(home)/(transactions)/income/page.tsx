import { SidebarInset } from "@workspace/ui/components/sidebar";
import { promises as fs } from "fs";
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
      <div className="container mx-auto p-10">
        <DataTable data={incomes} columns={columns} />
      </div>
    </SidebarInset>
  );
}
