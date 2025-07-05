package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rodneyosodo/dolla/backend/internal/dolla"
)

func getUserID(c *gin.Context) string {
	// Extract user ID from Clerk-provided headers
	userID := c.GetHeader("X-User-Id")
	if userID == "" {
		userID = c.GetHeader("clerk-user-id")
	}

	return userID
}

func createIncomes(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		userID := getUserID(c)
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID required"})

			return
		}

		var incomes []dolla.Income
		if err := c.ShouldBindJSON(&incomes); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

			return
		}

		// Set user ID for all incomes
		for i := range incomes {
			incomes[i].UserID = userID
		}

		if err := svc.CreateIncome(c.Request.Context(), incomes...); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	}
}

func getIncome(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		userID := getUserID(c)
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID required"})

			return
		}

		id := c.Param("id")
		income, err := svc.GetIncome(c.Request.Context(), userID, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, income)
	}
}

func listIncomes(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		userID := getUserID(c)
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID required"})

			return
		}

		query := dolla.Query{}
		if err := c.ShouldBindQuery(&query); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

			return
		}
		if query.Limit == 0 {
			query.Limit = 100
		}

		incomes, err := svc.ListIncomes(c.Request.Context(), userID, query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, incomes)
	}
}

func updateIncome(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		id := c.Param("id")
		var income dolla.Income
		if err := c.ShouldBindJSON(&income); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

			return
		}
		income.ID = id

		if err := svc.UpdateIncome(c.Request.Context(), income); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	}
}

func deleteIncome(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		userID := getUserID(c)
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID required"})

			return
		}

		id := c.Param("id")
		if err := svc.DeleteIncome(c.Request.Context(), userID, id); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	}
}

func createExpenses(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		userID := getUserID(c)
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID required"})

			return
		}

		var expenses []dolla.Expense
		if err := c.ShouldBindJSON(&expenses); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

			return
		}

		// Set user ID for all expenses
		for i := range expenses {
			expenses[i].UserID = userID
		}

		if err := svc.CreateExpense(c.Request.Context(), expenses...); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	}
}

func getExpense(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		userID := getUserID(c)
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID required"})

			return
		}

		id := c.Param("id")
		expense, err := svc.GetExpense(c.Request.Context(), userID, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, expense)
	}
}

func listExpenses(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		userID := getUserID(c)
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID required"})

			return
		}

		query := dolla.Query{}
		if err := c.ShouldBindQuery(&query); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

			return
		}
		if query.Limit == 0 {
			query.Limit = 100
		}

		expenses, err := svc.ListExpenses(c.Request.Context(), userID, query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, expenses)
	}
}

func updateExpense(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		id := c.Param("id")
		var expense dolla.Expense
		if err := c.ShouldBindJSON(&expense); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

			return
		}
		expense.ID = id

		if err := svc.UpdateExpense(c.Request.Context(), expense); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	}
}

func deleteExpense(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		userID := getUserID(c)
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID required"})

			return
		}

		id := c.Param("id")
		if err := svc.DeleteExpense(c.Request.Context(), userID, id); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	}
}

func createTransactions(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		userID := getUserID(c)
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID required"})

			return
		}

		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

			return
		}

		statementType := c.Param("type")

		if err := svc.CreateTransaction(c.Request.Context(), userID, dolla.Statement(statementType), file); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	}
}

func getUserProfile(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		clerkUserID := c.Param("clerk_user_id")

		profile, err := svc.GetUserProfile(c.Request.Context(), clerkUserID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})

			return
		}

		c.JSON(http.StatusOK, profile)
	}
}

func completeOnboarding(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		clerkUserID := c.Param("clerk_user_id")

		var req dolla.OnboardingRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

			return
		}

		response, err := svc.CompleteOnboarding(c.Request.Context(), clerkUserID, req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		if !response.Success {
			c.JSON(http.StatusBadRequest, response)

			return
		}

		c.JSON(http.StatusOK, response)
	}
}

func createBudgets(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		userID := getUserID(c)
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID required"})

			return
		}

		var budgets []dolla.Budget
		if err := c.ShouldBindJSON(&budgets); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

			return
		}

		// Set user ID for all budgets
		for i := range budgets {
			budgets[i].UserID = userID
		}

		if err := svc.CreateBudget(c.Request.Context(), budgets...); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	}
}

func getBudget(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		userID := getUserID(c)
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID required"})

			return
		}

		id := c.Param("id")
		budget, err := svc.GetBudget(c.Request.Context(), userID, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, budget)
	}
}

func listBudgets(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		userID := getUserID(c)
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID required"})

			return
		}

		query := dolla.Query{}
		if err := c.ShouldBindQuery(&query); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

			return
		}
		if query.Limit == 0 {
			query.Limit = 100
		}

		month := c.Query("month")
		budgets, err := svc.ListBudgets(c.Request.Context(), userID, query, month)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, budgets)
	}
}

func updateBudget(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		id := c.Param("id")
		var budget dolla.Budget
		if err := c.ShouldBindJSON(&budget); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

			return
		}
		budget.ID = id

		if err := svc.UpdateBudget(c.Request.Context(), budget); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	}
}

func deleteBudget(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		userID := getUserID(c)
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID required"})

			return
		}

		id := c.Param("id")
		if err := svc.DeleteBudget(c.Request.Context(), userID, id); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	}
}

func getBudgetSummary(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		userID := getUserID(c)
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID required"})

			return
		}

		month := c.Query("month")
		if month == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "month parameter is required"})

			return
		}

		summary, err := svc.GetBudgetSummary(c.Request.Context(), userID, month)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, summary)
	}
}

func calculateBudgetProgress(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		userID := getUserID(c)
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID required"})

			return
		}

		month := c.Query("month")
		if month == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "month parameter is required"})

			return
		}

		if err := svc.CalculateBudgetProgress(c.Request.Context(), userID, month); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Budget progress calculated successfully"})
	}
}
