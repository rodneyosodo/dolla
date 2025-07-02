import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface UserProfile {
  id: string;
  clerk_user_id: string;
  age: number;
  life_stage: string;
  income_bracket: string;
  goals: string[];
  onboarding_complete: boolean;
}

export const useOnboarding = () => {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isLoaded || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/onboarding/${user.id}`);

        if (response.status === 404) {
          setNeedsOnboarding(true);
          setProfile(null);
        } else if (response.ok) {
          const profileData = await response.json();
          setProfile(profileData);
          setNeedsOnboarding(!profileData.onboarding_complete);
        } else {
          console.error("Failed to fetch profile");
          setNeedsOnboarding(true);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setNeedsOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, isLoaded]);

  return {
    profile,
    needsOnboarding,
    isLoading: isLoading || !isLoaded,
    refreshProfile: async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/onboarding/${user.id}`);
        if (response.ok) {
          const profileData = await response.json();
          setProfile(profileData);
          setNeedsOnboarding(!profileData.onboarding_complete);
        }
      } catch (error) {
        console.error("Error refreshing profile:", error);
      }
    },
  };
};
