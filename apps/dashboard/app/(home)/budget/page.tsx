import { Button } from "@workspace/ui/components/button";
import { SidebarInset } from "@workspace/ui/components/sidebar";
import { CirclePlus } from "lucide-react";
import NavHeader from "@/components/nav-header";
import { TableDemo } from "./components/table";

export default function Page() {
  return (
    <SidebarInset>
      <NavHeader parent={{ title: "Budget", url: "/budget" }} />
      <div className="flex flex-col gap-6 mx-auto p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Monthly Budget
            </h2>
            <p className="text-muted-foreground">
              Here's a list of all your budget items.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <CirclePlus className="h-4 w-4 mr-2" />
              Create New Budget Item
            </Button>
          </div>
        </div>
        <div className="p-0">
          <TableDemo />
        </div>
      </div>
    </SidebarInset>
  );
}
