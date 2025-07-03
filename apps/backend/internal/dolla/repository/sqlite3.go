package repository

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/rodneyosodo/dolla/backend/internal/dolla"
	_ "modernc.org/sqlite"
)

const (
	provisionSQL = `
	CREATE TABLE IF NOT EXISTS expenses (
		id UUID PRIMARY KEY,
		date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		created_by VARCHAR(255),
		date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_by VARCHAR(255),
		active BOOLEAN DEFAULT TRUE,
		meta JSONB DEFAULT '{}',
		date VARCHAR(10),
		merchant VARCHAR(1024),
		category VARCHAR(255),
		description TEXT,
		payment_method VARCHAR(255),
		amount REAL,
		status VARCHAR(255)
	);

	CREATE TABLE IF NOT EXISTS incomes (
		id UUID PRIMARY KEY,
		date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		created_by VARCHAR(255),
		date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_by VARCHAR(255),
		active BOOLEAN DEFAULT TRUE,
		meta JSONB DEFAULT '{}',
		date VARCHAR(10),
		source VARCHAR(1024),
		category VARCHAR(255),
		description TEXT,
		payment_method VARCHAR(255),
		amount REAL,
		currency VARCHAR(255),
		is_recurring BOOLEAN DEFAULT FALSE,
		original_amount REAL,
		status VARCHAR(255)
	);

	CREATE TABLE IF NOT EXISTS user_profiles (
		id UUID PRIMARY KEY,
		date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		created_by VARCHAR(255),
		date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_by VARCHAR(255),
		active BOOLEAN DEFAULT TRUE,
		meta JSONB DEFAULT '{}',
		clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
		age INTEGER NOT NULL,
		life_stage VARCHAR(50) NOT NULL,
		income_bracket VARCHAR(50) NOT NULL,
		goals TEXT NOT NULL,
		onboarding_complete BOOLEAN DEFAULT FALSE
	);

	CREATE TABLE IF NOT EXISTS budgets (
		id UUID PRIMARY KEY,
		date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		created_by VARCHAR(255),
		date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_by VARCHAR(255),
		active BOOLEAN DEFAULT TRUE,
		meta JSONB DEFAULT '{}',
		month VARCHAR(7) NOT NULL,
		category VARCHAR(255) NOT NULL,
		budget_amount REAL NOT NULL,
		spent_amount REAL DEFAULT 0.0,
		remaining_amount REAL DEFAULT 0.0,
		percentage_used REAL DEFAULT 0.0,
		is_overspent BOOLEAN DEFAULT FALSE,
		UNIQUE(month, category)
	);
	`

	percent           = 100.0
	maxBudgets uint64 = 1000
)

type sqlite3 struct {
	db *sqlx.DB
}

func NewRepository(file string) (dolla.Repository, error) {
	db, err := sqlx.Open("sqlite", file)
	if err != nil {
		return nil, err
	}

	_, err = db.Exec(provisionSQL)
	if err != nil {
		return nil, err
	}

	return &sqlite3{
		db: db,
	}, nil
}

func (r *sqlite3) CreateIncome(ctx context.Context, incomes ...dolla.Income) error {
	if len(incomes) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}

	for i := range incomes {
		query := `INSERT INTO incomes
		(id, date_created, created_by, date_updated, updated_by, active, meta,
		date, source, category, description, payment_method, amount, currency,
		is_recurring, original_amount, status)
		VALUES (:id, :date_created, :created_by, :date_updated, :updated_by,
		:active, :meta, :date, :source, :category, :description, :payment_method,
		:amount, :currency, :is_recurring, :original_amount, :status)`

		if _, err := tx.NamedExecContext(ctx, query, incomes[i]); err != nil {
			if err := tx.Rollback(); err != nil {
				slog.Error("failed to rollback transaction", slog.String("err", err.Error()))
			}

			return err
		}
	}

	if err := tx.Commit(); err != nil {
		if err := tx.Rollback(); err != nil {
			slog.Error("failed to rollback transaction", slog.String("err", err.Error()))
		}

		return err
	}

	return nil
}

func (r *sqlite3) GetIncome(ctx context.Context, id string) (dolla.Income, error) {
	query := `SELECT * FROM incomes WHERE id = $1`
	rows, err := r.db.QueryxContext(ctx, query, id)
	if err != nil {
		return dolla.Income{}, err
	}
	defer func() {
		if err := rows.Close(); err != nil {
			slog.Error("failed to close rows", slog.String("err", err.Error()))
		}
	}()

	if rows.Next() {
		var income dolla.Income
		if err := rows.StructScan(&income); err != nil {
			return dolla.Income{}, err
		}

		return income, nil
	}

	return dolla.Income{}, errors.New("not found")
}

func (r *sqlite3) ListIncomes(ctx context.Context, query dolla.Query) (dolla.IncomePage, error) {
	q := fmt.Sprintf(`SELECT * FROM incomes LIMIT %d OFFSET %d`, query.Limit, query.Offset)
	rows, err := r.db.QueryxContext(ctx, q)
	if err != nil {
		return dolla.IncomePage{}, err
	}
	defer func() {
		if err := rows.Close(); err != nil {
			slog.Error("failed to close rows", slog.String("err", err.Error()))
		}
	}()

	incomes := make([]dolla.Income, 0)
	for rows.Next() {
		var income dolla.Income
		if err := rows.StructScan(&income); err != nil {
			return dolla.IncomePage{}, err
		}

		incomes = append(incomes, income)
	}

	tq := `SELECT COUNT(*) FROM incomes`
	rows, err = r.db.QueryxContext(ctx, tq)
	if err != nil {
		return dolla.IncomePage{}, err
	}

	total := uint64(0)
	if rows.Next() {
		if err := rows.Scan(&total); err != nil {
			return dolla.IncomePage{}, err
		}
	}

	return dolla.IncomePage{
		Offset:  query.Offset,
		Limit:   query.Limit,
		Total:   total,
		Incomes: incomes,
	}, nil
}

func (r *sqlite3) UpdateIncome(ctx context.Context, income dolla.Income) error { //nolint:cyclop
	queries := []string{
		`date_updated = :date_updated`,
	}
	if !income.Date.Time.IsZero() {
		queries = append(queries, `date = :date`)
	}
	if income.Source != "" {
		queries = append(queries, `source = :source`)
	}
	if income.Category != "" {
		queries = append(queries, `category = :category`)
	}
	if income.Description != "" {
		queries = append(queries, `description = :description`)
	}
	if income.PaymentMethod != "" {
		queries = append(queries, `payment_method = :payment_method`)
	}
	if income.Amount != 0 {
		queries = append(queries, `amount = :amount`)
	}
	if income.Currency != "" {
		queries = append(queries, `currency = :currency`)
	}
	if income.IsRecurring {
		queries = append(queries, `is_recurring = :is_recurring`)
	}
	if income.OriginalAmount != 0 {
		queries = append(queries, `original_amount = :original_amount`)
	}
	if income.Status != "" {
		queries = append(queries, `status = :status`)
	}

	query := fmt.Sprintf(`UPDATE incomes SET %s WHERE id = :id`, strings.Join(queries, ", "))
	if _, err := r.db.NamedExecContext(ctx, query, income); err != nil {
		return err
	}

	return nil
}

func (r *sqlite3) DeleteIncome(ctx context.Context, id string) error {
	query := `DELETE FROM incomes WHERE id = $1`
	if _, err := r.db.ExecContext(ctx, query, id); err != nil {
		return err
	}

	return nil
}

func (r *sqlite3) CreateExpense(ctx context.Context, expenses ...dolla.Expense) error {
	if len(expenses) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	for i := range expenses {
		query := `INSERT INTO expenses
		(id, date_created, created_by, date_updated, updated_by, active, meta,
		date, merchant, category, description, payment_method, amount, status)
		VALUES (:id, :date_created, :created_by, :date_updated, :updated_by,
		:active, :meta, :date, :merchant, :category, :description, :payment_method,
		:amount, :status)`

		if _, err := tx.NamedExecContext(ctx, query, expenses[i]); err != nil {
			if err := tx.Rollback(); err != nil {
				slog.Error("failed to rollback transaction", slog.String("err", err.Error()))
			}

			return err
		}
	}

	if err := tx.Commit(); err != nil {
		if err := tx.Rollback(); err != nil {
			slog.Error("failed to rollback transaction", slog.String("err", err.Error()))
		}

		return err
	}

	return nil
}

func (r *sqlite3) GetExpense(ctx context.Context, id string) (dolla.Expense, error) {
	query := `SELECT * FROM expenses WHERE id = $1`
	rows, err := r.db.QueryxContext(ctx, query, id)
	if err != nil {
		return dolla.Expense{}, err
	}
	defer func() {
		if err := rows.Close(); err != nil {
			slog.Error("failed to close rows", slog.String("err", err.Error()))
		}
	}()

	if rows.Next() {
		var expense dolla.Expense
		if err := rows.StructScan(&expense); err != nil {
			return dolla.Expense{}, err
		}

		return expense, nil
	}

	return dolla.Expense{}, errors.New("not found")
}

func (r *sqlite3) ListExpenses(ctx context.Context, query dolla.Query) (dolla.ExpensePage, error) {
	q := fmt.Sprintf(`SELECT * FROM expenses LIMIT %d OFFSET %d`, query.Limit, query.Offset)
	rows, err := r.db.QueryxContext(ctx, q)
	if err != nil {
		return dolla.ExpensePage{}, err
	}
	defer func() {
		if err := rows.Close(); err != nil {
			slog.Error("failed to close rows", slog.String("err", err.Error()))
		}
	}()

	expenses := make([]dolla.Expense, 0)
	for rows.Next() {
		var expense dolla.Expense
		if err := rows.StructScan(&expense); err != nil {
			return dolla.ExpensePage{}, err
		}

		expenses = append(expenses, expense)
	}

	tq := `SELECT COUNT(*) FROM expenses`
	rows, err = r.db.QueryxContext(ctx, tq)
	if err != nil {
		return dolla.ExpensePage{}, err
	}

	total := uint64(0)
	if rows.Next() {
		if err := rows.Scan(&total); err != nil {
			return dolla.ExpensePage{}, err
		}
	}

	return dolla.ExpensePage{
		Offset:   query.Offset,
		Limit:    query.Limit,
		Total:    total,
		Expenses: expenses,
	}, nil
}

func (r *sqlite3) UpdateExpense(ctx context.Context, expense dolla.Expense) error {
	queries := []string{
		`date_updated = :date_updated`,
	}
	if !expense.Date.Time.IsZero() {
		queries = append(queries, `date = :date`)
	}
	if expense.Merchant != "" {
		queries = append(queries, `merchant = :merchant`)
	}
	if expense.Category != "" {
		queries = append(queries, `category = :category`)
	}
	if expense.Description != "" {
		queries = append(queries, `description = :description`)
	}
	if expense.PaymentMethod != "" {
		queries = append(queries, `payment_method = :payment_method`)
	}
	if expense.Amount != 0 {
		queries = append(queries, `amount = :amount`)
	}
	if expense.Status != "" {
		queries = append(queries, `status = :status`)
	}

	query := fmt.Sprintf(`UPDATE expenses SET %s WHERE id = :id`, strings.Join(queries, ", "))
	if _, err := r.db.NamedExecContext(ctx, query, expense); err != nil {
		return err
	}

	return nil
}

func (r *sqlite3) DeleteExpense(ctx context.Context, id string) error {
	query := `DELETE FROM expenses WHERE id = $1`
	if _, err := r.db.ExecContext(ctx, query, id); err != nil {
		return err
	}

	return nil
}

func (r *sqlite3) GetUserProfile(ctx context.Context, clerkUserID string) (dolla.UserProfile, error) {
	query := `
		SELECT id, date_created, created_by, date_updated, updated_by, active, meta,
		       clerk_user_id, age, life_stage, income_bracket, goals, onboarding_complete
		FROM user_profiles 
		WHERE clerk_user_id = $1 AND active = true
	`

	var profile dolla.UserProfile
	var goalsJSON string

	err := r.db.QueryRowContext(ctx, query, clerkUserID).Scan(
		&profile.ID,
		&profile.DateCreated,
		&profile.CreatedBy,
		&profile.DateUpdated,
		&profile.UpdatedBy,
		&profile.Active,
		&profile.Meta,
		&profile.ClerkUserID,
		&profile.Age,
		&profile.LifeStage,
		&profile.IncomeBracket,
		&goalsJSON,
		&profile.OnboardingComplete,
	)
	if err != nil {
		return dolla.UserProfile{}, err
	}

	if err := profile.UnmarshalGoals(goalsJSON); err != nil {
		return dolla.UserProfile{}, fmt.Errorf("failed to unmarshal goals: %w", err)
	}

	return profile, nil
}

func (r *sqlite3) CreateUserProfile(ctx context.Context, profile dolla.UserProfile) error {
	goalsJSON, err := profile.MarshalGoals()
	if err != nil {
		return fmt.Errorf("failed to marshal goals: %w", err)
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	query := `
		INSERT INTO user_profiles (
			id, date_created, created_by, date_updated, updated_by, active, meta,
			clerk_user_id, age, life_stage, income_bracket, goals, onboarding_complete
		) VALUES (
			:id, :date_created, :created_by, :date_updated, :updated_by, :active, :meta,
			:clerk_user_id, :age, :life_stage, :income_bracket, :goals, :onboarding_complete
		)
	`

	_, err = tx.NamedExecContext(ctx, query, map[string]interface{}{
		"id":                  profile.ID,
		"date_created":        profile.DateCreated,
		"created_by":          profile.CreatedBy,
		"date_updated":        profile.DateUpdated,
		"updated_by":          profile.UpdatedBy,
		"active":              profile.Active,
		"meta":                profile.Meta,
		"clerk_user_id":       profile.ClerkUserID,
		"age":                 profile.Age,
		"life_stage":          profile.LifeStage,
		"income_bracket":      profile.IncomeBracket,
		"goals":               goalsJSON,
		"onboarding_complete": profile.OnboardingComplete,
	})
	if err != nil {
		if rbErr := tx.Rollback(); rbErr != nil {
			slog.Error("failed to rollback transaction", slog.String("err", rbErr.Error()))
		}

		return fmt.Errorf("failed to create user profile: %w", err)
	}

	updateQuery := `UPDATE user_profiles SET goals = $1 WHERE id = $2`
	_, err = tx.ExecContext(ctx, updateQuery, goalsJSON, profile.ID)
	if err != nil {
		if rbErr := tx.Rollback(); rbErr != nil {
			slog.Error("failed to rollback transaction", slog.String("err", rbErr.Error()))
		}

		return fmt.Errorf("failed to update goals: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *sqlite3) UpdateUserProfile(ctx context.Context, profile dolla.UserProfile) error {
	goalsJSON, err := profile.MarshalGoals()
	if err != nil {
		return fmt.Errorf("failed to marshal goals: %w", err)
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	query := `
		UPDATE user_profiles SET
			date_updated = :date_updated,
			updated_by = :updated_by,
			age = :age,
			life_stage = :life_stage,
			income_bracket = :income_bracket,
			goals = $1,
			onboarding_complete = :onboarding_complete,
			meta = :meta
		WHERE id = :id AND active = true
	`

	result, err := tx.NamedExecContext(ctx, query, map[string]interface{}{
		"id":                  profile.ID,
		"date_updated":        profile.DateUpdated,
		"updated_by":          profile.UpdatedBy,
		"age":                 profile.Age,
		"life_stage":          profile.LifeStage,
		"income_bracket":      profile.IncomeBracket,
		"onboarding_complete": profile.OnboardingComplete,
		"meta":                profile.Meta,
	})
	if err != nil {
		if rbErr := tx.Rollback(); rbErr != nil {
			slog.Error("failed to rollback transaction", slog.String("err", rbErr.Error()))
		}

		return fmt.Errorf("failed to update user profile: %w", err)
	}

	// Update goals separately
	_, err = tx.ExecContext(ctx, `UPDATE user_profiles SET goals = $1 WHERE id = $2`, goalsJSON, profile.ID)
	if err != nil {
		if rbErr := tx.Rollback(); rbErr != nil {
			slog.Error("failed to rollback transaction", slog.String("err", rbErr.Error()))
		}

		return fmt.Errorf("failed to update goals: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user profile not found or already inactive: %s", profile.ID)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *sqlite3) CreateBudget(ctx context.Context, budgets ...dolla.Budget) error {
	if len(budgets) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}

	for i := range budgets {
		budgets[i].RemainingAmount = budgets[i].BudgetAmount - budgets[i].SpentAmount
		if budgets[i].BudgetAmount > 0 {
			budgets[i].PercentageUsed = (budgets[i].SpentAmount / budgets[i].BudgetAmount) * percent
		}
		budgets[i].IsOverspent = budgets[i].SpentAmount > budgets[i].BudgetAmount

		query := `INSERT INTO budgets
		(id, date_created, created_by, date_updated, updated_by, active, meta,
		month, category, budget_amount, spent_amount, remaining_amount, 
		percentage_used, is_overspent)
		VALUES (:id, :date_created, :created_by, :date_updated, :updated_by,
		:active, :meta, :month, :category, :budget_amount, :spent_amount,
		:remaining_amount, :percentage_used, :is_overspent)`

		if _, err := tx.NamedExecContext(ctx, query, budgets[i]); err != nil {
			if err := tx.Rollback(); err != nil {
				slog.Error("failed to rollback transaction", slog.String("err", err.Error()))
			}

			return err
		}
	}

	if err := tx.Commit(); err != nil {
		if err := tx.Rollback(); err != nil {
			slog.Error("failed to rollback transaction", slog.String("err", err.Error()))
		}

		return err
	}

	return nil
}

func (r *sqlite3) GetBudget(ctx context.Context, id string) (dolla.Budget, error) {
	query := `SELECT * FROM budgets WHERE id = $1 AND active = true`
	rows, err := r.db.QueryxContext(ctx, query, id)
	if err != nil {
		return dolla.Budget{}, err
	}
	defer func() {
		if err := rows.Close(); err != nil {
			slog.Error("failed to close rows", slog.String("err", err.Error()))
		}
	}()

	if rows.Next() {
		var budget dolla.Budget
		if err := rows.StructScan(&budget); err != nil {
			return dolla.Budget{}, err
		}

		return budget, nil
	}

	return dolla.Budget{}, errors.New("budget not found")
}

func (r *sqlite3) ListBudgets( //nolint:cyclop
	ctx context.Context, query dolla.Query, month string,
) (dolla.BudgetPage, error) {
	var q string
	var args []interface{}

	switch month {
	case "":
		q = fmt.Sprintf(`SELECT * FROM budgets WHERE active = true LIMIT %d OFFSET %d`, query.Limit, query.Offset)
	default:
		q = fmt.Sprintf(
			`SELECT * FROM budgets WHERE active = true AND month = $1 LIMIT %d OFFSET %d`,
			query.Limit, query.Offset,
		)
		args = append(args, month)
	}

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return dolla.BudgetPage{}, err
	}
	defer func() {
		if err := rows.Close(); err != nil {
			slog.Error("failed to close rows", slog.String("err", err.Error()))
		}
	}()

	budgets := make([]dolla.Budget, 0)
	for rows.Next() {
		var budget dolla.Budget
		if err := rows.StructScan(&budget); err != nil {
			return dolla.BudgetPage{}, err
		}
		budgets = append(budgets, budget)
	}

	var tq string
	switch month {
	case "":
		tq = `SELECT COUNT(*) FROM budgets WHERE active = true`
		rows, err = r.db.QueryxContext(ctx, tq)
	default:
		tq = `SELECT COUNT(*) FROM budgets WHERE active = true AND month = $1`
		rows, err = r.db.QueryxContext(ctx, tq, month)
	}

	if err != nil {
		return dolla.BudgetPage{}, err
	}

	total := uint64(0)
	if rows.Next() {
		if err := rows.Scan(&total); err != nil {
			return dolla.BudgetPage{}, err
		}
	}

	return dolla.BudgetPage{
		Offset:  query.Offset,
		Limit:   query.Limit,
		Total:   total,
		Budgets: budgets,
	}, nil
}

func (r *sqlite3) UpdateBudget(ctx context.Context, budget dolla.Budget) error {
	queries := []string{
		`date_updated = :date_updated`,
	}
	if budget.Month != "" {
		queries = append(queries, `month = :month`)
	}
	if budget.Category != "" {
		queries = append(queries, `category = :category`)
	}
	if budget.BudgetAmount != 0 {
		queries = append(queries, `budget_amount = :budget_amount`)
	}
	if budget.SpentAmount != 0 {
		queries = append(queries, `spent_amount = :spent_amount`)
	}
	if budget.RemainingAmount != 0 {
		queries = append(queries, `remaining_amount = :remaining_amount`)
	}
	if budget.PercentageUsed != 0 {
		queries = append(queries, `percentage_used = :percentage_used`)
	}
	queries = append(queries, `is_overspent = :is_overspent`)

	query := fmt.Sprintf(`UPDATE budgets SET %s WHERE id = :id AND active = true`, strings.Join(queries, ", "))
	if _, err := r.db.NamedExecContext(ctx, query, budget); err != nil {
		return err
	}

	return nil
}

func (r *sqlite3) DeleteBudget(ctx context.Context, id string) error {
	query := `UPDATE budgets SET active = false WHERE id = $1`
	if _, err := r.db.ExecContext(ctx, query, id); err != nil {
		return err
	}

	return nil
}

func (r *sqlite3) GetBudgetSummary(ctx context.Context, month string) (dolla.BudgetSummary, error) {
	query := `
		SELECT 
			COALESCE(SUM(budget_amount), 0) as total_budget,
			COALESCE(SUM(spent_amount), 0) as total_spent,
			COALESCE(SUM(remaining_amount), 0) as total_remaining,
			COALESCE(COUNT(CASE WHEN is_overspent = true THEN 1 END), 0) as categories_overspent,
			COALESCE(COUNT(CASE WHEN is_overspent = false THEN 1 END), 0) as categories_on_track,
			COALESCE(COUNT(*), 0) as categories_with_budgets
		FROM budgets 
		WHERE active = true AND month = $1
	`

	var summary dolla.BudgetSummary
	var totalBudget, totalSpent, totalRemaining float64
	var categoriesOverspent, categoriesOnTrack, categoriesWithBudgets int

	err := r.db.QueryRowContext(ctx, query, month).Scan(
		&totalBudget,
		&totalSpent,
		&totalRemaining,
		&categoriesOverspent,
		&categoriesOnTrack,
		&categoriesWithBudgets,
	)
	if err != nil {
		return dolla.BudgetSummary{}, err
	}

	summary.TotalBudget = totalBudget
	summary.TotalSpent = totalSpent
	summary.TotalRemaining = totalRemaining
	summary.CategoriesOverspent = categoriesOverspent
	summary.CategoriesOnTrack = categoriesOnTrack
	summary.CategoriesWithBudgets = categoriesWithBudgets

	if totalBudget > 0 {
		summary.OverallPercentageUsed = (totalSpent / totalBudget) * percent
	}

	return summary, nil
}

func (r *sqlite3) CalculateBudgetProgress(ctx context.Context, month string) error { //nolint:cyclop
	// Get all budgets for the month
	budgets, err := r.ListBudgets(ctx, dolla.Query{Limit: maxBudgets}, month)
	if err != nil {
		return err
	}

	if len(budgets.Budgets) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}

	for i := range budgets.Budgets {
		spentQuery := `
			SELECT COALESCE(SUM(amount), 0) 
			FROM expenses 
			WHERE active = true 
			  AND category = $1 
			  AND strftime('%Y-%m', date) = $2
		`

		var spentAmount float64
		err := tx.QueryRowContext(ctx, spentQuery, budgets.Budgets[i].Category, month).Scan(&spentAmount)
		if err != nil {
			if err := tx.Rollback(); err != nil {
				slog.Error("failed to rollback transaction", slog.String("err", err.Error()))
			}

			return err
		}

		remainingAmount := budgets.Budgets[i].BudgetAmount - spentAmount
		var percentageUsed float64
		if budgets.Budgets[i].BudgetAmount > 0 {
			percentageUsed = (spentAmount / budgets.Budgets[i].BudgetAmount) * percent
		}
		isOverspent := spentAmount > budgets.Budgets[i].BudgetAmount

		updateQuery := `
			UPDATE budgets 
			SET spent_amount = $1, 
			    remaining_amount = $2, 
			    percentage_used = $3, 
			    is_overspent = $4,
			    date_updated = CURRENT_TIMESTAMP
			WHERE id = $5 AND active = true
		`

		_, err = tx.ExecContext(
			ctx, updateQuery, spentAmount,
			remainingAmount, percentageUsed, isOverspent, budgets.Budgets[i].ID,
		)
		if err != nil {
			if err := tx.Rollback(); err != nil {
				slog.Error("failed to rollback transaction", slog.String("err", err.Error()))
			}

			return err
		}
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}
