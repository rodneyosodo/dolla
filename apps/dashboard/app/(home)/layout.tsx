import { SidebarProvider } from "@workspace/ui/components/sidebar";
import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/theme-switcher";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      {children}
    </SidebarProvider>
  );
}
