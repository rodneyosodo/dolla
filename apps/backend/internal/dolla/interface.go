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
}
