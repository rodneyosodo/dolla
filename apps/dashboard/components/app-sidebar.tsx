"use client";

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
  Landmark,
  LifeBuoy,
  Notebook,
  Receipt,
  Send,
  Wallet,
} from "lucide-react";
import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";

const data = {
  user: {
    name: "rodneyosodo",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
      title: "Accounts",
      url: "/accounts",
      icon: Wallet,
    },
    {
      title: "Budget",
      url: "/budget",
      icon: Notebook,
    },
    {
      title: "Bills",
      url: "/bills",
      icon: Receipt,
    },
    {
      title: "Investments",
      url: "#",
      icon: Landmark,
      items: [
        {
          title: "XYZ MMF",
          url: "#",
        },
        {
          title: "XYZ Treasury",
          url: "#",
        },
        {
          title: "XYZ Stocks",
          url: "#",
        },
      ],
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-2">
              <a href="#">
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
