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
	`
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
