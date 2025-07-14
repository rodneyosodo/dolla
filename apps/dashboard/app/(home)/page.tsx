import { SidebarInset } from "@workspace/ui/components/sidebar";
import NavHeader from "@/components/nav-header";
import { AccountsSummary } from "./components/accounts-summary";
import { ChartAreaInteractive } from "./components/chart-area-interactive";
import { RecentTransactionsTable } from "./components/recent-transactions-table";
import { SectionCards } from "./components/section-cards";

export default function Page() {
  return (
    <SidebarInset>
      <NavHeader parent={{ title: "Dashboard", url: "/" }} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <AccountsSummary />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <div className="px-4 lg:px-6">
              <RecentTransactionsTable />
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
