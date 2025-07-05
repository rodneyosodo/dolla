package dolla

import (
	"context"
	"mime/multipart"
)

type Repository interface {
	CreateIncome(ctx context.Context, incomes ...Income) error
	GetIncome(ctx context.Context, userID, id string) (Income, error)
	ListIncomes(ctx context.Context, userID string, query Query) (IncomePage, error)
	UpdateIncome(ctx context.Context, income Income) error
	DeleteIncome(ctx context.Context, userID, id string) error

	CreateExpense(ctx context.Context, expenses ...Expense) error
	GetExpense(ctx context.Context, userID, id string) (Expense, error)
	ListExpenses(ctx context.Context, userID string, query Query) (ExpensePage, error)
	UpdateExpense(ctx context.Context, expense Expense) error
	DeleteExpense(ctx context.Context, userID, id string) error

	GetUserProfile(ctx context.Context, clerkUserID string) (UserProfile, error)
	CreateUserProfile(ctx context.Context, profile UserProfile) error
	UpdateUserProfile(ctx context.Context, profile UserProfile) error

	CreateBudget(ctx context.Context, budgets ...Budget) error
	GetBudget(ctx context.Context, userID, id string) (Budget, error)
	ListBudgets(ctx context.Context, userID string, query Query, month string) (BudgetPage, error)
	UpdateBudget(ctx context.Context, budget Budget) error
	DeleteBudget(ctx context.Context, userID, id string) error
	GetBudgetSummary(ctx context.Context, userID, month string) (BudgetSummary, error)
	CalculateBudgetProgress(ctx context.Context, userID, month string) error
}

type Service interface {
	CreateTransaction(ctx context.Context, userID string, ttype Statement, file *multipart.FileHeader) error

	CreateIncome(ctx context.Context, incomes ...Income) error
	GetIncome(ctx context.Context, userID, id string) (Income, error)
	ListIncomes(ctx context.Context, userID string, query Query) (IncomePage, error)
	UpdateIncome(ctx context.Context, income Income) error
	DeleteIncome(ctx context.Context, userID, id string) error

	CreateExpense(ctx context.Context, expenses ...Expense) error
	GetExpense(ctx context.Context, userID, id string) (Expense, error)
	ListExpenses(ctx context.Context, userID string, query Query) (ExpensePage, error)
	UpdateExpense(ctx context.Context, expense Expense) error
	DeleteExpense(ctx context.Context, userID, id string) error

	GetUserProfile(ctx context.Context, clerkUserID string) (UserProfile, error)
	CreateUserProfile(ctx context.Context, profile UserProfile) error
	UpdateUserProfile(ctx context.Context, profile UserProfile) error
	CompleteOnboarding(ctx context.Context, clerkUserID string, req OnboardingRequest) (OnboardingResponse, error)

	CreateBudget(ctx context.Context, budgets ...Budget) error
	GetBudget(ctx context.Context, userID, id string) (Budget, error)
	ListBudgets(ctx context.Context, userID string, query Query, month string) (BudgetPage, error)
	UpdateBudget(ctx context.Context, budget Budget) error
	DeleteBudget(ctx context.Context, userID, id string) error
	GetBudgetSummary(ctx context.Context, userID, month string) (BudgetSummary, error)
	CalculateBudgetProgress(ctx context.Context, userID, month string) error
}
