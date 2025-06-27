package dolla

import (
	"context"
	"fmt"
	"mime/multipart"
	"net/http"
)

type service struct {
	repo            Repository
	pdfExtractorURL string
}

func NewService(repo Repository, pdfExtractorURL string) Service {
	return &service{
		repo:            repo,
		pdfExtractorURL: pdfExtractorURL,
	}
}

func (s *service) CreateTransaction(ctx context.Context, ttype Statement, fileHeader *multipart.FileHeader) error {
	file, err := fileHeader.Open()
	if err != nil {
		return err
	}
	defer file.Close()

	switch ttype {
	case MpesaStatement:
		incomes, expenses, err := Mpesa(ctx, http.DefaultClient, s.pdfExtractorURL, file)
		if err != nil {
			return err
		}

		if err := s.CreateIncome(ctx, incomes...); err != nil {
			return err
		}
		if err := s.CreateExpense(ctx, expenses...); err != nil {
			return err
		}

		return nil
	case IMBankStatement:
		return fmt.Errorf("unsupported statement type: %s", ttype)
	default:
		return fmt.Errorf("unsupported statement type: %s", ttype)
	}
}

func (s *service) CreateIncome(ctx context.Context, incomes ...Income) error {
	for i := range incomes {
		incomes[i].PopulateDataOnCreate(ctx)
	}

	return s.repo.CreateIncome(ctx, incomes...)
}

func (s *service) GetIncome(ctx context.Context, id string) (Income, error) {
	return s.repo.GetIncome(ctx, id)
}

func (s *service) ListIncomes(ctx context.Context, query Query) (IncomePage, error) {
	return s.repo.ListIncomes(ctx, query)
}

func (s *service) UpdateIncome(ctx context.Context, income Income) error {
	income.PopulateDataOnUpdate(ctx)

	return s.repo.UpdateIncome(ctx, income)
}

func (s *service) DeleteIncome(ctx context.Context, id string) error {
	return s.repo.DeleteIncome(ctx, id)
}

func (s *service) CreateExpense(ctx context.Context, expenses ...Expense) error {
	for i := range expenses {
		expenses[i].PopulateDataOnCreate(ctx)
	}

	return s.repo.CreateExpense(ctx, expenses...)
}

func (s *service) GetExpense(ctx context.Context, id string) (Expense, error) {
	return s.repo.GetExpense(ctx, id)
}

func (s *service) ListExpenses(ctx context.Context, query Query) (ExpensePage, error) {
	return s.repo.ListExpenses(ctx, query)
}

func (s *service) UpdateExpense(ctx context.Context, expense Expense) error {
	expense.PopulateDataOnUpdate(ctx)

	return s.repo.UpdateExpense(ctx, expense)
}

func (s *service) DeleteExpense(ctx context.Context, id string) error {
	return s.repo.DeleteExpense(ctx, id)
}
