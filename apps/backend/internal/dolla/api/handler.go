package api

import (
	"github.com/gin-gonic/gin"
	"github.com/rodneyosodo/dolla/backend/internal/dolla"
)

func NewHandler(svc dolla.Service, router *gin.Engine) *gin.Engine {
	router.POST("/incomes", createIncomes(svc))
	router.GET("/incomes", listIncomes(svc))
	router.GET("/incomes/:id", getIncome(svc))
	router.PUT("/incomes/:id", updateIncome(svc))
	router.DELETE("/incomes/:id", deleteIncome(svc))

	router.POST("/expenses", createExpenses(svc))
	router.GET("/expenses", listExpenses(svc))
	router.GET("/expenses/:id", getExpense(svc))
	router.PUT("/expenses/:id", updateExpense(svc))
	router.DELETE("/expenses/:id", deleteExpense(svc))

	router.POST("/transactions/:type", createTransactions(svc))

	return router
}
