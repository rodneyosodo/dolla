package dolla

import "encoding/json"

type LifeStage string

const (
	LifeStageStudent       LifeStage = "student"
	LifeStageEarlyCareer   LifeStage = "early_career"
	LifeStageEstablished   LifeStage = "established"
	LifeStagePreRetirement LifeStage = "pre_retirement"
	LifeStageRetired       LifeStage = "retired"
)

type IncomeBracket string

const (
	IncomeBracketLow    IncomeBracket = "low"    // 0-50k
	IncomeBracketMid    IncomeBracket = "mid"    // 50k-100k
	IncomeBracketHigh   IncomeBracket = "high"   // 100k+
	IncomeBracketVaries IncomeBracket = "varies" // Irregular income
)

type FinancialGoal string

const (
	GoalEmergencyFund FinancialGoal = "emergency_fund"
	GoalDebtPayoff    FinancialGoal = "debt_payoff"
	GoalHomeBuying    FinancialGoal = "home_buying"
	GoalRetirement    FinancialGoal = "retirement"
	GoalInvestment    FinancialGoal = "investment"
	GoalEducation     FinancialGoal = "education"
	GoalTravel        FinancialGoal = "travel"
	GoalBusiness      FinancialGoal = "business"
	GoalOther         FinancialGoal = "other"
)

type UserProfile struct {
	BaseEntity

	ClerkUserID        string          `db:"clerk_user_id"       json:"clerk_user_id"`
	Age                int             `db:"age"                 json:"age"`
	LifeStage          LifeStage       `db:"life_stage"          json:"life_stage"`
	IncomeBracket      IncomeBracket   `db:"income_bracket"      json:"income_bracket"`
	Goals              []FinancialGoal `db:"goals"               json:"goals"`
	OnboardingComplete bool            `db:"onboarding_complete" json:"onboarding_complete"`
}

func (u *UserProfile) MarshalGoals() (string, error) {
	if len(u.Goals) == 0 {
		return "[]", nil
	}

	goalStrings := make([]string, len(u.Goals))
	for i, goal := range u.Goals {
		goalStrings[i] = string(goal)
	}

	bytes, err := json.Marshal(goalStrings)

	return string(bytes), err
}

func (u *UserProfile) UnmarshalGoals(data string) error {
	if data == "" || data == "[]" {
		u.Goals = []FinancialGoal{}

		return nil
	}

	var goalStrings []string
	if err := json.Unmarshal([]byte(data), &goalStrings); err != nil {
		return err
	}

	goals := make([]FinancialGoal, len(goalStrings))
	for i, goalStr := range goalStrings {
		goals[i] = FinancialGoal(goalStr)
	}

	u.Goals = goals

	return nil
}

type OnboardingRequest struct {
	Age           int             `json:"age"`
	LifeStage     LifeStage       `json:"life_stage"`
	IncomeBracket IncomeBracket   `json:"income_bracket"`
	Goals         []FinancialGoal `json:"goals"`
}

type OnboardingResponse struct {
	Success bool         `json:"success"`
	Profile *UserProfile `json:"profile,omitempty"`
	Message string       `json:"message,omitempty"`
}
