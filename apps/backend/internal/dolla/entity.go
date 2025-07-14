package dolla

import (
	"context"
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
)

type Statement string

const (
	MpesaStatement  Statement = "mpesa"
	IMBankStatement Statement = "imbank"
)

type PaymentMethod string

const (
	MpesaTill       PaymentMethod = "m-pesa (till)"
	MpesaPaybill    PaymentMethod = "m-pesa (paybill)"
	MpesaSendMoney  PaymentMethod = "m-pesa (send money)"
	MpesaOnline     PaymentMethod = "m-pesa (online)"
	Cash            PaymentMethod = "cash"
	BankTransfer    PaymentMethod = "bank transfer"
	BankStandingOrd PaymentMethod = "bank standing order"
	CardDebit       PaymentMethod = "card (debit)"
	CardCredit      PaymentMethod = "card (credit)"
	Cheque          PaymentMethod = "cheque"
	Pesalink        PaymentMethod = "pesalink"
	AirtelMoney     PaymentMethod = "airtel money"
	EquitelMoney    PaymentMethod = "equitel money"
	Tkash           PaymentMethod = "t-kash"
	Paypal          PaymentMethod = "paypal"
	GooglePay       PaymentMethod = "google pay"
	ApplePay        PaymentMethod = "apple pay"
	OtherMethod     PaymentMethod = "other"
)

type Category string

const (
	// Income related.
	SalaryWages           Category = "salary / wages"
	FreelanceGigWork      Category = "freelance / gig work"
	BusinessSalesDaily    Category = "business sales / daily sales"
	RentalIncome          Category = "rental income"
	Dividends             Category = "dividends"
	Interest              Category = "interest"
	FarmProduceSales      Category = "farm produce sales"
	ConsultingFees        Category = "consulting fees"
	Commissions           Category = "commissions"
	GrantsBursaries       Category = "grants / bursaries"
	LoanRepaymentReceived Category = "loan repayment received"
	GiftsRemittances      Category = "gifts / remittances"
	// Expense related.
	Groceries         Category = "groceries"
	Utilities         Category = "utilities"
	RentHousing       Category = "rent / housing"
	Transport         Category = "transport"
	AirtimeData       Category = "airtime / data"
	FoodDiningOut     Category = "food - dining out"
	LoanRepayment     Category = "loan repayment"
	Clothing          Category = "clothing"
	Education         Category = "education"
	Health            Category = "health"
	Entertainment     Category = "entertainment"
	PersonalCare      Category = "personal care"
	SavingsInvestment Category = "savings / investment"
	TitheOfferings    Category = "tithe / offerings"
	RemittancesSent   Category = "remittances sent"

	OtherCategory Category = "other"
)

type Status string

const (
	Imported   Status = "imported"
	Reconciled Status = "reconciled"
	Canceled   Status = "canceled"
)

type Metadata map[string]any

func (m Metadata) Value() (driver.Value, error) {
	return json.Marshal(m)
}

func (m *Metadata) Scan(value any) error {
	if value == nil {
		return nil
	}

	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(b, &m)
}

type BaseEntity struct {
	ID          string    `db:"id"           json:"id"`
	DateCreated time.Time `db:"date_created" json:"dateCreated"`
	CreatedBy   string    `db:"created_by"   json:"createdBy"`
	DateUpdated time.Time `db:"date_updated" json:"dateUpdated"`
	UpdatedBy   string    `db:"updated_by"   json:"updatedBy"`
	Active      bool      `db:"active"       json:"active"`
	Meta        Metadata  `db:"meta"         json:"meta"`
}

func (be *BaseEntity) PopulateDataOnCreate(_ context.Context) {
	be.DateCreated = time.Now().UTC()
	be.Active = true
	be.ID = uuid.NewString()
}

func (be *BaseEntity) PopulateDataOnUpdate(_ context.Context) {
	be.DateUpdated = time.Now().UTC()
}

type Date struct {
	time.Time
}

func (d Date) String() string {
	return d.Format(time.DateOnly)
}

func (d *Date) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}
	t, err := time.Parse(time.DateOnly, s)
	if err != nil {
		return err
	}
	*d = Date{t}

	return nil
}

func (d Date) Value() (driver.Value, error) {
	return d.Time.Format(time.DateOnly), nil
}

func (d *Date) Scan(value any) error {
	if value == nil {
		return nil
	}

	s, ok := value.(string)
	if !ok {
		return errors.New("type assertion to string failed")
	}

	t, err := time.Parse(time.DateOnly, s)
	if err != nil {
		return err
	}
	*d = Date{t}

	return nil
}

func (d Date) MarshalJSON() ([]byte, error) {
	return json.Marshal(d.Time.Format(time.DateOnly))
}

type Expense struct {
	BaseEntity

	UserID        string        `db:"user_id"        json:"userId"`
	AccountID     string        `db:"account_id"     json:"accountId"`
	Date          Date          `db:"date"           json:"date"`
	Merchant      string        `db:"merchant"       json:"merchant"`
	Category      Category      `db:"category"       json:"category"`
	Description   string        `db:"description"    json:"description"`
	PaymentMethod PaymentMethod `db:"payment_method" json:"paymentMethod"`
	Amount        float64       `db:"amount"         json:"amount"`
	Status        Status        `db:"status"         json:"status"`
}

type Income struct {
	BaseEntity

	UserID         string        `db:"user_id"         json:"userId"`
	AccountID      string        `db:"account_id"      json:"accountId"`
	Date           Date          `db:"date"            json:"date"`
	Source         string        `db:"source"          json:"source"`
	Category       Category      `db:"category"        json:"category"`
	Description    string        `db:"description"     json:"description"`
	PaymentMethod  PaymentMethod `db:"payment_method"  json:"paymentMethod"`
	Amount         float64       `db:"amount"          json:"amount"`
	Currency       string        `db:"currency"        json:"currency"`
	IsRecurring    bool          `db:"is_recurring"    json:"isRecurring"`
	OriginalAmount float64       `db:"original_amount" json:"originalAmount"`
	Status         Status        `db:"status"          json:"status"`
}

type Query struct {
	Offset uint64 `json:"offset"`
	Limit  uint64 `json:"limit"`
}

type IncomePage struct {
	Offset  uint64   `json:"offset"`
	Limit   uint64   `json:"limit"`
	Total   uint64   `json:"total"`
	Incomes []Income `json:"incomes"`
}

type ExpensePage struct {
	Offset   uint64    `json:"offset"`
	Limit    uint64    `json:"limit"`
	Total    uint64    `json:"total"`
	Expenses []Expense `json:"expenses"`
}

type Budget struct {
	BaseEntity

	UserID          string   `db:"user_id"            json:"userId"`
	Month           string   `db:"month"              json:"month"`
	Category        Category `db:"category"           json:"category"`
	BudgetAmount    float64  `db:"budget_amount"      json:"budgetAmount"`
	SpentAmount     float64  `db:"spent_amount"       json:"spentAmount"`
	RemainingAmount float64  `db:"remaining_amount"   json:"remainingAmount"`
	PercentageUsed  float64  `db:"percentage_used"    json:"percentageUsed"`
	IsOverspent     bool     `db:"is_overspent"       json:"isOverspent"`
}

type BudgetPage struct {
	Offset  uint64   `json:"offset"`
	Limit   uint64   `json:"limit"`
	Total   uint64   `json:"total"`
	Budgets []Budget `json:"budgets"`
}

type BudgetSummary struct {
	TotalBudget           float64 `json:"totalBudget"`
	TotalSpent            float64 `json:"totalSpent"`
	TotalRemaining        float64 `json:"totalRemaining"`
	OverallPercentageUsed float64 `json:"overallPercentageUsed"`
	CategoriesOverspent   int     `json:"categoriesOverspent"`
	CategoriesOnTrack     int     `json:"categoriesOnTrack"`
	CategoriesWithBudgets int     `json:"categoriesWithBudgets"`
}

type Account struct {
	BaseEntity
	UserID      string  `db:"user_id"      json:"userId"`
	Name        string  `db:"name"         json:"name"`
	AccountType string  `db:"account_type" json:"accountType"`
	Balance     float64 `db:"balance"      json:"balance"`
	Currency    string  `db:"currency"     json:"currency"`
	Description string  `db:"description"  json:"description"`
}

type AccountPage struct {
	Offset   uint64    `json:"offset"`
	Limit    uint64    `json:"limit"`
	Total    uint64    `json:"total"`
	Accounts []Account `json:"accounts"`
}
