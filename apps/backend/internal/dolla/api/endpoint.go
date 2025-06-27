package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rodneyosodo/dolla/backend/internal/dolla"
)

func createIncomes(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		var incomes []dolla.Income
		if err := c.ShouldBindJSON(&incomes); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

			return
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
		id := c.Param("id")
		income, err := svc.GetIncome(c.Request.Context(), id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, income)
	}
}

func listIncomes(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		query := dolla.Query{}
		if err := c.ShouldBindQuery(&query); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

			return
		}
		if query.Limit == 0 {
			query.Limit = 100
		}

		incomes, err := svc.ListIncomes(c.Request.Context(), query)
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
		id := c.Param("id")
		if err := svc.DeleteIncome(c.Request.Context(), id); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	}
}

func createExpenses(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		var expenses []dolla.Expense
		if err := c.ShouldBindJSON(&expenses); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

			return
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
		id := c.Param("id")
		expense, err := svc.GetExpense(c.Request.Context(), id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, expense)
	}
}

func listExpenses(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		query := dolla.Query{}
		if err := c.ShouldBindQuery(&query); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

			return
		}
		if query.Limit == 0 {
			query.Limit = 100
		}

		expenses, err := svc.ListExpenses(c.Request.Context(), query)
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
		id := c.Param("id")
		if err := svc.DeleteExpense(c.Request.Context(), id); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	}
}

func createTransactions(svc dolla.Service) func(c *gin.Context) {
	return func(c *gin.Context) {
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

			return
		}

		statementType := c.Param("type")

		if err := svc.CreateTransaction(c.Request.Context(), dolla.Statement(statementType), file); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	}
}
