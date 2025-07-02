import { currentUser } from "@clerk/nextjs/server";
import { SidebarProvider } from "@workspace/ui/components/sidebar";
import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { OnboardingGuard } from "@/components/onboarding-guard";

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await currentUser();
  if (!user) return <div>Not signed in</div>;

  const avatar = user?.imageUrl;
  const userName = user?.username || user?.firstName || "";
  const emailAddress =
    user?.emailAddresses.find(
      (email) => email.id === user?.primaryEmailAddressId,
    )?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "";

  return (
    <OnboardingGuard>
      <SidebarProvider>
        <AppSidebar
          user={{
            name: userName,
            email: emailAddress,
            avatar: avatar,
          }}
        />
        {children}
      </SidebarProvider>
    </OnboardingGuard>
  );
}
