import { currentUser } from "@clerk/nextjs/server";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import {
  ArrowLeftRight,
  ChartArea,
  Command,
  CreditCard,
  LifeBuoy,
  Notebook,
  Send,
} from "lucide-react";
import type { ComponentProps } from "react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: ChartArea,
      isActive: true,
    },
    {
      title: "Transactions",
      url: "#",
      icon: ArrowLeftRight,
      items: [
        {
          title: "Income",
          url: "/income",
        },
        {
          title: "Expenses",
          url: "/expenses",
        },
      ],
    },
    {
      title: "Budget",
      url: "/budget",
      icon: Notebook,
    },
    {
      title: "Accounts",
      url: "/accounts",
      icon: CreditCard,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
};

export async function AppSidebar({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-2">
              <a href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">dolla</span>
                  <span className="truncate text-xs">v0.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
