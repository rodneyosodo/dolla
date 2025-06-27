package dolla

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Table struct {
	Zero  string `json:"0"`
	One   string `json:"1"`
	Two   string `json:"2"`
	Three string `json:"3"`
	Four  string `json:"4"`
	Five  string `json:"5"`
	Six   string `json:"6"`
}

type ExtractionResponse struct {
	Page   uint64    `json:"page"`
	Text   string    `json:"text"`
	Tables [][]Table `json:"tables"`
}

func Mpesa(ctx context.Context, client *http.Client, url string, file multipart.File) ([]Income, []Expense, error) {
	payload := &bytes.Buffer{}
	writer := multipart.NewWriter(payload)

	fileName := filepath.Base(uuid.NewString() + ".pdf")
	part1, err := writer.CreateFormFile("file", fileName)
	if err != nil {
		return nil, nil, err
	}
	if _, err = io.Copy(part1, file); err != nil {
		return nil, nil, err
	}

	if err := writer.Close(); err != nil {
		return nil, nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, payload)
	if err != nil {
		return nil, nil, err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	res, err := client.Do(req)
	if err != nil {
		return nil, nil, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, nil, err
	}

	var response []ExtractionResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, nil, err
	}

	var incomes []Income
	var expenses []Expense
	for i := range response {
		incomes = append(incomes, toIncome(response[i])...)
		expenses = append(expenses, toExpense(response[i])...)
	}

	return incomes, expenses, nil
}

func toIncome(response ExtractionResponse) []Income {
	var incomes []Income

	for _, tables := range response.Tables {
		for _, table := range tables {
			if table.Four == "" || table.Four == "Paid in" || table.Four == "0.00" {
				continue
			}

			amountStr := strings.ReplaceAll(table.Four, ",", "")
			amount, err := strconv.ParseFloat(amountStr, 64)
			if err != nil {
				continue
			}

			date, err := time.Parse(time.DateTime, table.One)
			if err != nil {
				continue
			}

			description := strings.TrimSpace(table.Two)
			if description == "" {
				return nil
			}

			if amount > 0 {
				income := Income{
					BaseEntity: BaseEntity{
						Meta: Metadata{
							"receiptNo":         table.Zero,
							"completionTime":    table.One,
							"transactionStatus": table.Three,
						},
					},
					Date:           Date{date},
					Source:         extractSource(description),
					Category:       toCategory(description),
					Description:    description,
					PaymentMethod:  toPaymentMethod(description),
					Amount:         amount,
					Currency:       "KES",
					IsRecurring:    isRecurringTransaction(description),
					OriginalAmount: amount,
					Status:         Imported,
				}
				incomes = append(incomes, income)
			}
		}
	}

	return incomes
}

func toExpense(response ExtractionResponse) []Expense {
	var expenses []Expense

	for _, tables := range response.Tables {
		for _, table := range tables {
			if table.Five == "" || table.Five == "Withdraw\nn" || table.Five == "0.00" {
				continue
			}

			amountStr := strings.ReplaceAll(table.Five, ",", "")
			amount, err := strconv.ParseFloat(amountStr, 64)
			if err != nil {
				continue
			}

			description := strings.TrimSpace(table.Two)
			if description == "" {
				return nil
			}

			if amount > 0 {
				date, err := time.Parse(time.DateTime, table.One)
				if err != nil {
					continue
				}

				expense := Expense{
					BaseEntity: BaseEntity{
						Meta: Metadata{
							"receiptNo":         table.Zero,
							"completionTime":    table.One,
							"transactionStatus": table.Three,
						},
					},
					Date:          Date{date},
					Merchant:      extractMerchant(description),
					Category:      toCategory(description),
					Description:   description,
					PaymentMethod: toPaymentMethod(description),
					Amount:        amount,
					Status:        Imported,
				}
				expenses = append(expenses, expense)
			}
		}
	}

	return expenses
}

func extractSource(description string) string {
	description = strings.ToUpper(description)
	lines := strings.Split(description, "\n")

	if len(lines) > 0 {
		return strings.TrimSpace(lines[len(lines)-1])
	}

	return "Unknown Source"
}

func extractMerchant(description string) string {
	description = strings.ToUpper(description)
	lines := strings.Split(description, "\n")

	if len(lines) > 0 {
		merchant := strings.TrimSpace(lines[len(lines)-1])

		merchant = strings.ReplaceAll(merchant, "PAYBILL", "")
		merchant = strings.ReplaceAll(merchant, "TILL", "")
		merchant = strings.TrimSpace(merchant)
		if merchant != "" {
			return merchant
		}
	}

	return "Unknown Merchant"
}

func toCategory(description string) Category { //nolint:cyclop
	description = strings.ToUpper(description)

	switch {
	case strings.Contains(description, "SALARY"), strings.Contains(description, "WAGES"):
		return SalaryWages
	case strings.Contains(description, "BUSINESS PAYMENT"), strings.Contains(description, "FREELANCE"),
		strings.Contains(description, "COMMISSION"), strings.Contains(description, "CONSULTING"):
		return FreelanceGigWork
	case strings.Contains(description, "TRANSFER FROM BANK"), strings.Contains(description, "LOAN DISBURSEMENT"):
		return FreelanceGigWork
	case strings.Contains(description, "FUNDS RECEIVED"), strings.Contains(description, "GIFT"),
		strings.Contains(description, "FAMILY"), strings.Contains(description, "RELATIVE"):
		return GiftsRemittances
	case strings.Contains(description, "RENT"), strings.Contains(description, "RENTAL"):
		return RentalIncome
	case strings.Contains(description, "INTEREST"), strings.Contains(description, "DIVIDEND"):
		return Interest
	case strings.Contains(description, "FARM"), strings.Contains(description, "PRODUCE"),
		strings.Contains(description, "HARVEST"):
		return FarmProduceSales
	case strings.Contains(description, "SALE"), strings.Contains(description, "SHOP"),
		strings.Contains(description, "CUSTOMER"):
		return BusinessSalesDaily

	case strings.Contains(description, "KPLC"), strings.Contains(description, "ELECTRICITY"),
		strings.Contains(description, "WATER"), strings.Contains(description, "NAIROBI WATER"),
		strings.Contains(description, "ELECTRICITY BILL"):
		return Utilities
	case strings.Contains(description, "SUPERMARKET"), strings.Contains(description, "GROCERY"),
		strings.Contains(description, "NAIVAS"), strings.Contains(description, "TUSKYS"),
		strings.Contains(description, "CARREFOUR"), strings.Contains(description, "QUICKMART"):
		return Groceries
	case strings.Contains(description, "UBER"), strings.Contains(description, "BOLT"),
		strings.Contains(description, "MATATU"), strings.Contains(description, "BUS"),
		strings.Contains(description, "FUEL"), strings.Contains(description, "PETROL"):
		return Transport
	case strings.Contains(description, "AIRTIME"), strings.Contains(description, "DATA"),
		strings.Contains(description, "SAFARICOM"), strings.Contains(description, "AIRTEL"):
		return AirtimeData
	case strings.Contains(description, "RESTAURANT"), strings.Contains(description, "HOTEL"),
		strings.Contains(description, "CAFE"), strings.Contains(description, "KFC"),
		strings.Contains(description, "PIZZA"):
		return FoodDiningOut
	case strings.Contains(description, "HOSPITAL"), strings.Contains(description, "CLINIC"),
		strings.Contains(description, "PHARMACY"), strings.Contains(description, "DOCTOR"):
		return Health
	case strings.Contains(description, "SCHOOL"), strings.Contains(description, "UNIVERSITY"),
		strings.Contains(description, "COLLEGE"), strings.Contains(description, "TUITION"):
		return Education
	case strings.Contains(description, "CINEMA"), strings.Contains(description, "MOVIE"),
		strings.Contains(description, "NETFLIX"), strings.Contains(description, "SHOWMAX"):
		return Entertainment
	case strings.Contains(description, "CLOTHING"), strings.Contains(description, "FASHION"),
		strings.Contains(description, "SHOES"):
		return Clothing
	case strings.Contains(description, "TITHE"), strings.Contains(description, "OFFERING"),
		strings.Contains(description, "CHURCH"), strings.Contains(description, "DONATION"):
		return TitheOfferings
	case strings.Contains(description, "LOAN"), strings.Contains(description, "CREDIT"),
		strings.Contains(description, "REPAYMENT"):
		return LoanRepayment
	case strings.Contains(description, "SALON"), strings.Contains(description, "BARBER"),
		strings.Contains(description, "SPA"):
		return PersonalCare
	case strings.Contains(description, "SAVINGS"), strings.Contains(description, "INVESTMENT"),
		strings.Contains(description, "SACCO"):
		return SavingsInvestment
	default:
		return OtherCategory
	}
}

func toPaymentMethod(description string) PaymentMethod {
	description = strings.ToUpper(description)

	switch {
	case strings.Contains(description, "TRANSFER FROM BANK"), strings.Contains(description, "BANK TRANSFER"):
		return BankTransfer
	case strings.Contains(description, "BUSINESS PAYMENT"), strings.Contains(description, "PAYBILL"),
		strings.Contains(description, "PAY BILL"):
		return MpesaPaybill
	case strings.Contains(description, "TILL"), strings.Contains(description, "BUY GOODS"):
		return MpesaTill
	case strings.Contains(description, "SEND MONEY"), strings.Contains(description, "SENT TO"),
		strings.Contains(description, "RECEIVED FROM"):
		return MpesaSendMoney
	case strings.Contains(description, "CASH"), strings.Contains(description, "WITHDRAW"),
		strings.Contains(description, "AGENT"):
		return Cash
	case strings.Contains(description, "AIRTEL MONEY"):
		return AirtelMoney
	case strings.Contains(description, "EQUITEL"):
		return EquitelMoney
	case strings.Contains(description, "T-KASH"):
		return Tkash
	default:
		return MpesaOnline
	}
}

func isRecurringTransaction(description string) bool {
	description = strings.ToUpper(description)

	recurringPatterns := []string{
		// Income patterns
		"SALARY", "WAGES", "PENSION", "ALLOWANCE",
		"RENTAL INCOME", "DIVIDEND", "INTEREST",
		// Expense patterns
		"SUBSCRIPTION", "RENT", "RENTAL", "LEASE",
		"INSURANCE", "LOAN REPAYMENT", "MORTGAGE",
		"SCHOOL FEES", "TUITION", "TITHE",
		"NETFLIX", "SHOWMAX", "DSTV", "GOTV",
		"GYM MEMBERSHIP", "MONTHLY", "WEEKLY",
		"UTILITIES", "KPLC", "WATER BILL",
	}

	for _, pattern := range recurringPatterns {
		if strings.Contains(description, pattern) {
			return true
		}
	}

	return false
}
