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
					Source:         toSource(table.Two),
					Category:       toCategory(table.Two),
					Description:    table.Two,
					PaymentMethod:  toPaymentMethod(table.Two),
					Amount:         amount,
					Currency:       "KES",
					IsRecurring:    isRecurringTransaction(table.Two),
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
					Merchant:      toSource(table.Two),
					Category:      toCategory(table.Two),
					Description:   table.Two,
					PaymentMethod: toPaymentMethod(table.Two),
					Amount:        amount,
					Status:        Imported,
				}
				expenses = append(expenses, expense)
			}
		}
	}

	return expenses
}

func toSource(description string) string {
	description = strings.ToUpper(description)
	splits := strings.Split(description, "\n")

	return splits[len(splits)-1]
}

func toCategory(description string) Category {
	description = strings.ToUpper(description)

	switch {
	case strings.Contains(description, "FUNDS RECEIVED"):
		return GiftsRemittances
	case strings.Contains(description, "TRANSFER FROM BANK"):
		return FreelanceGigWork
	case strings.Contains(description, "BUSINESS PAYMENT"):
		return FreelanceGigWork
	default:
		return OtherCategory
	}
}

func toPaymentMethod(description string) PaymentMethod {
	description = strings.ToUpper(description)

	switch {
	case strings.Contains(description, "TRANSFER FROM BANK"):
		return BankTransfer
	case strings.Contains(description, "BUSINESS PAYMENT"):
		return MpesaPaybill
	default:
		return OtherMethod
	}
}

func isRecurringTransaction(description string) bool {
	description = strings.ToUpper(description)

	recurringPatterns := []string{
		"SUBSCRIPTION", "RENT", "SALARY",
	}

	for _, pattern := range recurringPatterns {
		if strings.Contains(description, pattern) {
			return true
		}
	}

	return false
}
