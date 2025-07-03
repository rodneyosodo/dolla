package dolla

import (
	"context"
	"mime/multipart"
)

type Repository interface {
	CreateIncome(ctx context.Context, incomes ...Income) error
	GetIncome(ctx context.Context, id string) (Income, error)
	ListIncomes(ctx context.Context, query Query) (IncomePage, error)
	UpdateIncome(ctx context.Context, income Income) error
	DeleteIncome(ctx context.Context, id string) error

	CreateExpense(ctx context.Context, expenses ...Expense) error
	GetExpense(ctx context.Context, id string) (Expense, error)
	ListExpenses(ctx context.Context, query Query) (ExpensePage, error)
	UpdateExpense(ctx context.Context, expense Expense) error
	DeleteExpense(ctx context.Context, id string) error

	GetUserProfile(ctx context.Context, clerkUserID string) (UserProfile, error)
	CreateUserProfile(ctx context.Context, profile UserProfile) error
	UpdateUserProfile(ctx context.Context, profile UserProfile) error

	CreateBudget(ctx context.Context, budgets ...Budget) error
	GetBudget(ctx context.Context, id string) (Budget, error)
	ListBudgets(ctx context.Context, query Query, month string) (BudgetPage, error)
	UpdateBudget(ctx context.Context, budget Budget) error
	DeleteBudget(ctx context.Context, id string) error
	GetBudgetSummary(ctx context.Context, month string) (BudgetSummary, error)
	CalculateBudgetProgress(ctx context.Context, month string) error
}

type Service interface {
	CreateTransaction(ctx context.Context, ttype Statement, file *multipart.FileHeader) error

	CreateIncome(ctx context.Context, incomes ...Income) error
	GetIncome(ctx context.Context, id string) (Income, error)
	ListIncomes(ctx context.Context, query Query) (IncomePage, error)
	UpdateIncome(ctx context.Context, income Income) error
	DeleteIncome(ctx context.Context, id string) error

	CreateExpense(ctx context.Context, expenses ...Expense) error
	GetExpense(ctx context.Context, id string) (Expense, error)
	ListExpenses(ctx context.Context, query Query) (ExpensePage, error)
	UpdateExpense(ctx context.Context, expense Expense) error
	DeleteExpense(ctx context.Context, id string) error

	GetUserProfile(ctx context.Context, clerkUserID string) (UserProfile, error)
	CreateUserProfile(ctx context.Context, profile UserProfile) error
	UpdateUserProfile(ctx context.Context, profile UserProfile) error
	CompleteOnboarding(ctx context.Context, clerkUserID string, req OnboardingRequest) (OnboardingResponse, error)

	CreateBudget(ctx context.Context, budgets ...Budget) error
	GetBudget(ctx context.Context, id string) (Budget, error)
	ListBudgets(ctx context.Context, query Query, month string) (BudgetPage, error)
	UpdateBudget(ctx context.Context, budget Budget) error
	DeleteBudget(ctx context.Context, id string) error
	GetBudgetSummary(ctx context.Context, month string) (BudgetSummary, error)
	CalculateBudgetProgress(ctx context.Context, month string) error
}
