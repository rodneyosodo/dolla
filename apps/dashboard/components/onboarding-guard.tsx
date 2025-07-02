"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { needsOnboarding, isLoading } = useOnboarding();

  useEffect(() => {
    if (!isLoading && needsOnboarding && pathname !== "/onboarding") {
      router.push("/onboarding");
    } else if (!isLoading && !needsOnboarding && pathname === "/onboarding") {
      router.push("/");
    }
  }, [needsOnboarding, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (needsOnboarding && pathname !== "/onboarding") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!needsOnboarding && pathname === "/onboarding") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <div className="flex min-h-screen">{children}</div>;
}
