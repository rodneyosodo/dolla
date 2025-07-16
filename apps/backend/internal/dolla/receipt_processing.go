package dolla

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"image"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"gocv.io/x/gocv"
)

type ReceiptItem struct {
	Name       string  `json:"name"`
	Quantity   int     `json:"quantity"`
	UnitPrice  float64 `json:"unit_price"`
	TotalPrice float64 `json:"total_price"`
}

type ReceiptData struct {
	MerchantName    string        `json:"merchant_name"`
	MerchantAddress string        `json:"merchant_address"`
	MerchantPhone   string        `json:"merchant_phone"`
	Date            string        `json:"date"`
	Time            string        `json:"time"`
	Category        string        `json:"category"`
	Items           []ReceiptItem `json:"items"`
	Subtotal        float64       `json:"subtotal"`
	Tax             float64       `json:"tax"`
	Total           float64       `json:"total"`
	PaymentMethod   string        `json:"payment_method"`
	ReceiptNumber   string        `json:"receipt_number"`
}

type OpenAIRequest struct {
	Model       string    `json:"model"`
	Messages    []Message `json:"messages"`
	Temperature float64   `json:"temperature"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIResponse struct {
	Choices []Choice  `json:"choices"`
	Error   *APIError `json:"error,omitempty"`
}

type Choice struct {
	Message Message `json:"message"`
}

type APIError struct {
	Message string `json:"message"`
	Type    string `json:"type"`
	Code    string `json:"code"`
}

type ReceiptProcessor struct {
	openaiAPIKey string
	modelName    string
	httpClient   *http.Client
}

func NewReceiptProcessor(apiKey, modelName string) *ReceiptProcessor {
	if modelName == "" {
		modelName = "gpt-4o-mini"
	}

	return &ReceiptProcessor{
		openaiAPIKey: apiKey,
		modelName:    modelName,
		httpClient:   &http.Client{Timeout: 60 * time.Second},
	}
}

func (rp *ReceiptProcessor) PreprocessImageMultiple(imagePath string) ([]string, error) {
	img := gocv.IMRead(imagePath, gocv.IMReadColor)
	if img.Empty() {
		return nil, fmt.Errorf("could not read image from %s", imagePath)
	}
	defer img.Close()

	var processedPaths []string
	baseName := strings.TrimSuffix(imagePath, filepath.Ext(imagePath))

	// Method 1: Basic grayscale + adaptive threshold
	gray := gocv.NewMat()
	defer gray.Close()
	gocv.CvtColor(img, &gray, gocv.ColorBGRToGray)

	thresh1 := gocv.NewMat()
	defer thresh1.Close()
	gocv.AdaptiveThreshold(gray, &thresh1, 255, gocv.AdaptiveThresholdMean, gocv.ThresholdBinary, 15, 10)

	path1 := baseName + "_method1.png"
	gocv.IMWrite(path1, thresh1)
	processedPaths = append(processedPaths, path1)

	// Method 2: Gaussian blur + OTSU threshold
	blurred := gocv.NewMat()
	defer blurred.Close()
	gocv.GaussianBlur(gray, &blurred, image.Pt(5, 5), 0, 0, gocv.BorderDefault)

	thresh2 := gocv.NewMat()
	defer thresh2.Close()
	gocv.Threshold(blurred, &thresh2, 0, 255, gocv.ThresholdBinary+gocv.ThresholdOtsu)

	path2 := baseName + "_method2.png"
	gocv.IMWrite(path2, thresh2)
	processedPaths = append(processedPaths, path2)

	// Method 3: Morphological operations
	kernel := gocv.GetStructuringElement(gocv.MorphRect, image.Pt(1, 1))
	defer kernel.Close()

	opened := gocv.NewMat()
	defer opened.Close()
	gocv.MorphologyEx(thresh1, &opened, gocv.MorphOpen, kernel)

	path3 := baseName + "_method3.png"
	gocv.IMWrite(path3, opened)
	processedPaths = append(processedPaths, path3)

	// Method 4: Enhanced contrast
	enhanced := gocv.NewMat()
	defer enhanced.Close()
	gocv.EqualizeHist(gray, &enhanced)

	thresh4 := gocv.NewMat()
	defer thresh4.Close()
	gocv.AdaptiveThreshold(enhanced, &thresh4, 255, gocv.AdaptiveThresholdGaussian, gocv.ThresholdBinary, 11, 2)

	path4 := baseName + "_method4.png"
	gocv.IMWrite(path4, thresh4)
	processedPaths = append(processedPaths, path4)

	return processedPaths, nil
}

func (rp *ReceiptProcessor) ExtractTextFromImageMultiple(imagePath string) (string, error) {
	texts := make(map[string]string)

	configs := []struct {
		name string
		args []string
	}{
		{
			name: "default",
			args: []string{"--oem", "3", "--psm", "6"},
		},
		{
			name: "single_column",
			args: []string{"--oem", "3", "--psm", "4"},
		},
		{
			name: "single_block",
			args: []string{"--oem", "3", "--psm", "8"},
		},
		{
			name: "single_word",
			args: []string{"--oem", "3", "--psm", "13"},
		},
		{
			name: "raw_line",
			args: []string{"--oem", "3", "--psm", "7"},
		},
	}

	for _, config := range configs {
		text, err := rp.extractTextWithConfig(imagePath, config.args)
		if err == nil && len(strings.TrimSpace(text)) > 10 {
			texts[config.name+"_original"] = text
		}
	}

	processedPaths, err := rp.PreprocessImageMultiple(imagePath)
	if err != nil {
		log.Printf("Warning: Could not preprocess image: %v", err)
	} else {
		defer func() {
			for _, path := range processedPaths {
				os.Remove(path)
			}
		}()

		for i, processedPath := range processedPaths {
			for _, config := range configs {
				text, err := rp.extractTextWithConfig(processedPath, config.args)
				if err == nil && len(strings.TrimSpace(text)) > 10 {
					key := fmt.Sprintf("%s_method%d", config.name, i+1)
					texts[key] = text
				}
			}
		}
	}

	bestText := ""
	bestScore := 0

	for _, text := range texts {
		score := rp.scoreOCRText(text)
		if score > bestScore {
			bestScore = score
			bestText = text
		}
	}

	if bestText == "" {
		return "", fmt.Errorf("all OCR attempts failed")
	}

	return rp.cleanExtractedText(bestText), nil
}

func (rp *ReceiptProcessor) extractTextWithConfig(imagePath string, args []string) (string, error) {
	cmdArgs := append([]string{imagePath, "stdout"}, args...)
	cmd := exec.Command("tesseract", cmdArgs...)

	var out bytes.Buffer
	cmd.Stdout = &out

	err := cmd.Run()
	if err != nil {
		return "", err
	}

	return out.String(), nil
}

func (rp *ReceiptProcessor) scoreOCRText(text string) int {
	if text == "" {
		return 0
	}

	score := 0
	cleanText := strings.TrimSpace(text)

	score += len(cleanText) / 10

	specialChars := regexp.MustCompile(`[^a-zA-Z0-9\s\.,\-\(\)/$:]`).FindAllString(cleanText, -1)
	score -= len(specialChars) * 2

	patterns := []string{
		`\$\d+\.\d{2}`,            // Price patterns
		`\d{1,2}/\d{1,2}/\d{2,4}`, // Date patterns
		`\d{1,2}:\d{2}`,           // Time patterns
		`(?i)total`,               // Total keyword
		`(?i)subtotal`,            // Subtotal keyword
		`(?i)tax`,                 // Tax keyword
	}

	for _, pattern := range patterns {
		if matched, _ := regexp.MatchString(pattern, cleanText); matched {
			score += 20
		}
	}

	words := strings.Fields(cleanText)
	readableWords := 0
	for _, word := range words {
		if len(word) > 2 && regexp.MustCompile(`^[a-zA-Z]+$`).MatchString(word) {
			readableWords++
		}
	}
	score += readableWords * 3

	return score
}

func (rp *ReceiptProcessor) cleanExtractedText(text string) string {
	re := regexp.MustCompile(`\s+`)
	text = re.ReplaceAllString(text, " ")

	lines := strings.Split(text, "\n")
	var cleanLines []string
	for _, line := range lines {
		if trimmed := strings.TrimSpace(line); trimmed != "" {
			cleanLines = append(cleanLines, trimmed)
		}
	}

	return strings.Join(cleanLines, "\n")
}

func (rp *ReceiptProcessor) ProcessReceiptToExpense(imagePath, userID string) ([]Expense, error) {
	receiptText, err := rp.ExtractTextFromImageMultiple(imagePath)
	if err != nil {
		return nil, fmt.Errorf("failed to extract text: %v", err)
	}

	if len(strings.TrimSpace(receiptText)) < 10 {
		log.Println("Warning: Very little text extracted from image")
		return rp.fallbackExpenseExtraction(receiptText, userID), nil
	}

	correctedText, err := rp.correctOCRWithAI(receiptText)
	if err == nil && len(correctedText) > len(receiptText)/2 {
		receiptText = correctedText
	}

	receiptData, err := rp.extractWithOpenAI(receiptText)
	if err != nil {
		log.Printf("OpenAI extraction failed: %v, falling back to basic extraction", err)
		return rp.fallbackExpenseExtraction(receiptText, userID), nil
	}

	expenses := rp.convertReceiptToExpenses(receiptData, userID)
	return expenses, nil
}

func (rp *ReceiptProcessor) convertReceiptToExpenses(receipt *ReceiptData, userID string) []Expense {
	var expenses []Expense
	now := time.Now()

	receiptDate, err := rp.parseReceiptDate(receipt.Date)
	if err != nil {
		receiptDate = now
	}

	metadata := Metadata{
		"receipt_number":   receipt.ReceiptNumber,
		"merchant_address": receipt.MerchantAddress,
		"merchant_phone":   receipt.MerchantPhone,
		"receipt_time":     receipt.Time,
		"subtotal":         receipt.Subtotal,
		"tax":              receipt.Tax,
		"total_items":      len(receipt.Items),
		"source":           "receipt_ocr",
	}

	if len(receipt.Items) == 0 || receipt.Total > 0 {
		expense := &Expense{
			BaseEntity: BaseEntity{
				ID:          rp.generateID(),
				DateCreated: now,
				CreatedBy:   userID,
				DateUpdated: now,
				UpdatedBy:   userID,
				Active:      true,
				Meta:        metadata,
			},
			UserID:        userID,
			Date:          Date{receiptDate},
			Merchant:      receipt.MerchantName,
			Category:      Category(receipt.Category),
			Description:   rp.generateDescription(receipt),
			PaymentMethod: PaymentMethod(receipt.PaymentMethod),
			Amount:        receipt.Total,
			Status:        Status("pending"),
		}
		expenses = append(expenses, *expense)
	}

	return expenses
}

func (rp *ReceiptProcessor) generateDescription(receipt *ReceiptData) string {
	if len(receipt.Items) == 0 {
		return fmt.Sprintf("Purchase at %s", receipt.MerchantName)
	}

	if len(receipt.Items) == 1 {
		return receipt.Items[0].Name
	}

	if len(receipt.Items) <= 3 {
		var itemNames []string
		for _, item := range receipt.Items {
			itemNames = append(itemNames, item.Name)
		}
		return strings.Join(itemNames, ", ")
	}

	return fmt.Sprintf("%d items from %s", len(receipt.Items), receipt.MerchantName)
}

func (rp *ReceiptProcessor) parseReceiptDate(dateStr string) (time.Time, error) {
	if dateStr == "" {
		return time.Time{}, fmt.Errorf("empty date string")
	}

	formats := []string{
		"2006-01-02",
		"01/02/2006",
		"01-02-2006",
		"02/01/2006",
		"2006/01/02",
		"2006-01-02 15:04:05",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("unable to parse date: %s", dateStr)
}

func (rp *ReceiptProcessor) generateID() string {
	return fmt.Sprintf("exp_%d", time.Now().UnixNano())
}

func (rp *ReceiptProcessor) correctOCRWithAI(ocrText string) (string, error) {
	prompt := fmt.Sprintf(`Please correct the OCR errors in this receipt text. Fix obvious character recognition mistakes while preserving the original structure and information. Return only the corrected text:

OCR Text:
%s`, ocrText)

	request := OpenAIRequest{
		Model:       rp.modelName,
		Temperature: 0.1,
		Messages: []Message{
			{Role: "system", Content: "You are an expert at correcting OCR errors in receipt text. Fix character recognition mistakes while preserving structure and meaning."},
			{Role: "user", Content: prompt},
		},
	}

	response, err := rp.callOpenAI(request)
	if err != nil {
		return "", err
	}

	return response, nil
}

var validCategories = map[string]bool{
	"grocery":       true,
	"restaurant":    true,
	"gas":           true,
	"retail":        true,
	"pharmacy":      true,
	"electronics":   true,
	"clothing":      true,
	"entertainment": true,
	"health":        true,
	"automotive":    true,
	"home":          true,
	"office":        true,
	"other":         true,
}

func (rp *ReceiptProcessor) validateCategory(category string) string {
	category = strings.ToLower(strings.TrimSpace(category))
	if validCategories[category] {
		return category
	}
	return "other"
}

func (rp *ReceiptProcessor) extractWithOpenAI(receiptText string) (*ReceiptData, error) {
	prompt := fmt.Sprintf(`Extract receipt information from the following text and return it as a JSON object with this exact structure:

{
  "merchant_name": "string",
  "merchant_address": "string", 
  "merchant_phone": "string",
  "date": "YYYY-MM-DD format",
  "time": "HH:MM format",
  "category": "string",
  "items": [
    {
      "name": "string",
      "quantity": 1,
      "unit_price": 0.0,
      "total_price": 0.0
    }
  ],
  "subtotal": 0.0,
  "tax": 0.0,
  "total": 0.0,
  "payment_method": "string",
  "receipt_number": "string"
}

Guidelines:
- Extract all items with their prices accurately
- Calculate unit_price as total_price / quantity when not explicit
- Be precise with amounts and prices
- If quantity is not specified, use 1
- Use empty strings for missing text fields
- Use 0.0 for missing numeric fields
- For category, choose from: grocery, restaurant, gas, retail, pharmacy, electronics, clothing, entertainment, health, automotive, home, office, other
- Categorize based on merchant type and items purchased
- Return only valid JSON, no explanations
- For items, extract the actual food/product names, not OCR garbage

Receipt text:
%s`, receiptText)

	request := OpenAIRequest{
		Model:       rp.modelName,
		Temperature: 0,
		Messages: []Message{
			{Role: "system", Content: "You are an expert at extracting structured information from receipts. Return only valid JSON with accurate data extraction and proper categorization."},
			{Role: "user", Content: prompt},
		},
	}

	response, err := rp.callOpenAI(request)
	if err != nil {
		return nil, err
	}

	response = strings.TrimSpace(response)
	if strings.HasPrefix(response, "```json") {
		response = strings.TrimPrefix(response, "```json")
		response = strings.TrimSuffix(response, "```")
		response = strings.TrimSpace(response)
	}

	var receiptData ReceiptData
	err = json.Unmarshal([]byte(response), &receiptData)
	if err != nil {
		return nil, fmt.Errorf("failed to parse OpenAI response: %v\nResponse: %s", err, response)
	}

	receiptData.Date = rp.validateDate(receiptData.Date)

	receiptData.Category = rp.validateCategory(receiptData.Category)

	return &receiptData, nil
}

func (rp *ReceiptProcessor) callOpenAI(request OpenAIRequest) (string, error) {
	jsonData, err := json.Marshal(request)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+rp.openaiAPIKey)

	resp, err := rp.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("OpenAI API returned status %d: %s", resp.StatusCode, string(body))
	}

	var openaiResp OpenAIResponse
	err = json.Unmarshal(body, &openaiResp)
	if err != nil {
		return "", err
	}

	if openaiResp.Error != nil {
		return "", fmt.Errorf("OpenAI API error: %s", openaiResp.Error.Message)
	}

	if len(openaiResp.Choices) == 0 {
		return "", fmt.Errorf("no response from OpenAI")
	}

	return openaiResp.Choices[0].Message.Content, nil
}

func (rp *ReceiptProcessor) validateDate(dateStr string) string {
	if dateStr == "" {
		return ""
	}

	formats := []string{
		"2006-01-02",
		"01/02/2006",
		"01-02-2006",
		"02/01/2006",
		"2006/01/02",
		"2006-01-02 15:04:05",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return t.Format("2006-01-02")
		}
	}

	return dateStr
}

func (rp *ReceiptProcessor) fallbackExpenseExtraction(text, userID string) []Expense {
	now := time.Now()

	var merchant, total, date string

	lines := strings.Split(text, "\n")
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed != "" && merchant == "" {
			merchant = trimmed
		}
	}

	totalRegex := regexp.MustCompile(`(?i)total[:\s]*\$?([\d,]+\.?\d*)`)
	if match := totalRegex.FindStringSubmatch(text); len(match) > 1 {
		total = match[1]
	}

	dateRegex := regexp.MustCompile(`(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})`)
	if match := dateRegex.FindStringSubmatch(text); len(match) > 1 {
		date = match[1]
	}

	amount := 0.0
	if total != "" {
		if parsedAmount, err := strconv.ParseFloat(strings.ReplaceAll(total, ",", ""), 64); err == nil {
			amount = parsedAmount
		}
	}

	receiptDate := now
	if date != "" {
		if parsed, err := rp.parseReceiptDate(date); err == nil {
			receiptDate = parsed
		}
	}

	expense := &Expense{
		BaseEntity: BaseEntity{
			ID:          rp.generateID(),
			DateCreated: now,
			CreatedBy:   userID,
			DateUpdated: now,
			UpdatedBy:   userID,
			Active:      true,
			Meta: Metadata{
				"source":     "receipt_ocr_fallback",
				"raw_text":   text,
				"confidence": "low",
			},
		},
		UserID:        userID,
		Date:          Date{receiptDate},
		Merchant:      merchant,
		Category:      Category("other"),
		Description:   "Receipt expense (auto-extracted)",
		PaymentMethod: PaymentMethod("unknown"),
		Amount:        amount,
		Status:        Status("pending"),
	}

	return []Expense{*expense}
}

func (rp *ReceiptProcessor) SaveExpensesToJSON(expenses []*Expense, outputPath string) error {
	data, err := json.MarshalIndent(expenses, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(outputPath, data, 0644)
}

func (rp *ReceiptProcessor) ExportExpensesToCSV(expenses []*Expense, outputPath string) error {
	file, err := os.Create(outputPath)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	header := []string{
		"id", "user_id", "date", "merchant", "category", "description",
		"payment_method", "amount", "status", "date_created", "created_by",
		"date_updated", "updated_by", "active",
	}
	writer.Write(header)

	for _, expense := range expenses {
		row := []string{
			expense.ID,
			expense.UserID,
			expense.Date.Format("2006-01-02"),
			expense.Merchant,
			string(expense.Category),
			expense.Description,
			string(expense.PaymentMethod),
			fmt.Sprintf("%.2f", expense.Amount),
			string(expense.Status),
			expense.DateCreated.Format("2006-01-02 15:04:05"),
			expense.CreatedBy,
			expense.DateUpdated.Format("2006-01-02 15:04:05"),
			expense.UpdatedBy,
			strconv.FormatBool(expense.Active),
		}
		writer.Write(row)
	}

	return nil
}
