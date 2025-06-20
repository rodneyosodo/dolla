import { SidebarInset } from "@workspace/ui/components/sidebar";
import NavHeader from "@/components/nav-header";

export default async function Page() {
  return (
    <SidebarInset>
      <NavHeader
        parent={{ title: "Transactions", url: "#" }}
        child={{ title: "Income" }}
      />
      <div className="container mx-auto p-10"></div>
    </SidebarInset>
  );
}
