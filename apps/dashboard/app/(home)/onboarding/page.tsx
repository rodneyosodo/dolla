"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { completeOnboarding } from "@/lib/api";

type LifeStage =
  | "student"
  | "early_career"
  | "established"
  | "pre_retirement"
  | "retired";
type IncomeBracket = "low" | "mid" | "high" | "varies";
type FinancialGoal =
  | "emergency_fund"
  | "debt_payoff"
  | "home_buying"
  | "retirement"
  | "investment"
  | "education"
  | "travel"
  | "business"
  | "other";

interface OnboardingRequest {
  age: number;
  life_stage: LifeStage;
  income_bracket: IncomeBracket;
  goals: FinancialGoal[];
}

const lifeStageOptions = [
  {
    value: "student",
    label: "Student",
    description: "Currently in school or university",
  },
  {
    value: "early_career",
    label: "Early Career",
    description: "Just starting out professionally",
  },
  {
    value: "established",
    label: "Established",
    description: "Mid-career with stable income",
  },
  {
    value: "pre_retirement",
    label: "Pre-Retirement",
    description: "Planning for retirement",
  },
  {
    value: "retired",
    label: "Retired",
    description: "No longer working full-time",
  },
];

const incomeBracketOptions = [
  {
    value: "low",
    label: "Under $50K",
    description: "Annual income below $50,000",
  },
  {
    value: "mid",
    label: "$50K - $100K",
    description: "Annual income between $50,000 - $100,000",
  },
  {
    value: "high",
    label: "$100K+",
    description: "Annual income above $100,000",
  },
  {
    value: "varies",
    label: "Varies",
    description: "Irregular or seasonal income",
  },
];

const goalOptions = [
  {
    value: "emergency_fund",
    label: "Emergency Fund",
    description: "Build financial safety net",
  },
  {
    value: "debt_payoff",
    label: "Debt Payoff",
    description: "Pay down existing debts",
  },
  {
    value: "home_buying",
    label: "Home Buying",
    description: "Save for property purchase",
  },
  {
    value: "retirement",
    label: "Retirement",
    description: "Long-term retirement planning",
  },
  {
    value: "investment",
    label: "Investment",
    description: "Build investment portfolio",
  },
  {
    value: "education",
    label: "Education",
    description: "Fund education expenses",
  },
  {
    value: "travel",
    label: "Travel",
    description: "Save for trips and experiences",
  },
  {
    value: "business",
    label: "Business",
    description: "Start or grow a business",
  },
  { value: "other", label: "Other", description: "Other financial goals" },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OnboardingRequest>({
    age: 25,
    life_stage: "early_career",
    income_bracket: "mid",
    goals: [],
  });

  const handleGoalToggle = (goal: FinancialGoal) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Validate form data
      if (!validateFormData()) {
        return;
      }

      // Update backend profile
      await completeOnboarding(user.id, formData);

      // Update Clerk public metadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          onboarding_complete: true,
          life_stage: formData.life_stage,
          age_range: getAgeRange(formData.age),
          income_bracket: formData.income_bracket,
          primary_goals: formData.goals.slice(0, 3), // Store top 3 goals
        },
      });

      router.push("/");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const validateFormData = (): boolean => {
    if (formData.age < 13 || formData.age > 120) {
      setError("Please enter a valid age between 13 and 120");
      return false;
    }

    if (!formData.life_stage) {
      setError("Please select your life stage");
      return false;
    }

    if (!formData.income_bracket) {
      setError("Please select your income bracket");
      return false;
    }

    if (formData.goals.length === 0) {
      setError("Please select at least one financial goal");
      return false;
    }

    if (formData.goals.length > 5) {
      setError("Please select no more than 5 financial goals");
      return false;
    }

    return true;
  };

  const getAgeRange = (age: number): string => {
    if (age < 25) return "18-24";
    if (age < 35) return "25-34";
    if (age < 45) return "35-44";
    if (age < 55) return "45-54";
    if (age < 65) return "55-64";
    return "65+";
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.age >= 13 && formData.age <= 120;
      case 2:
        return formData.life_stage && formData.life_stage.length > 0;
      case 3:
        return formData.income_bracket && formData.income_bracket.length > 0;
      case 4:
        return formData.goals.length > 0 && formData.goals.length <= 5;
      default:
        return false;
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-xl px-4 py-8">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Dolla!</CardTitle>
            <CardDescription>
              Let's personalize your financial journey with a few quick
              questions.
            </CardDescription>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full ${
                      step <= currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="age" className="text-base font-medium">
                    What's your age?
                  </Label>
                  <Select
                    value={formData.age.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, age: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your age" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 100 }, (_, i) => i + 13).map(
                        (age) => (
                          <SelectItem key={age} value={age.toString()}>
                            {age}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    What best describes your current life stage?
                  </Label>
                  <div className="mt-4 space-y-3">
                    {lifeStageOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3"
                      >
                        <input
                          type="radio"
                          id={option.value}
                          name="life_stage"
                          value={option.value}
                          checked={formData.life_stage === option.value}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              life_stage: e.target.value as LifeStage,
                            }))
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={option.value}
                            className="font-medium cursor-pointer"
                          >
                            {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    What's your approximate income bracket?
                  </Label>
                  <div className="mt-4 space-y-3">
                    {incomeBracketOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3"
                      >
                        <input
                          type="radio"
                          id={option.value}
                          name="income_bracket"
                          value={option.value}
                          checked={formData.income_bracket === option.value}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              income_bracket: e.target.value as IncomeBracket,
                            }))
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={option.value}
                            className="font-medium cursor-pointer"
                          >
                            {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    What are your main financial goals? (Select 1-5)
                  </Label>
                  <div className="mt-4 space-y-3">
                    {goalOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3"
                      >
                        <Checkbox
                          id={option.value}
                          checked={formData.goals.includes(
                            option.value as FinancialGoal,
                          )}
                          onCheckedChange={() =>
                            handleGoalToggle(option.value as FinancialGoal)
                          }
                          disabled={
                            !formData.goals.includes(
                              option.value as FinancialGoal,
                            ) && formData.goals.length >= 5
                          }
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={option.value}
                            className="font-medium cursor-pointer"
                          >
                            {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {formData.goals.length}/5
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
              >
                Back
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  disabled={!canProceed()}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || loading}
                >
                  {loading ? "Completing..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
