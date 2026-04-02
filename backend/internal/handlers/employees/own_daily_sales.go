package employees

import (
	"log"
	"net/url"
	"strconv"

	"github.com/gechjs/Pharmacy-App/internal/handlers/reports"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetOwnDailySalesReport(c *gin.Context) {
	employeeID, exists := c.Get("employee_id")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	id, ok := employeeID.(uuid.UUID)
	if !ok {
		log.Println(employeeID)
		c.JSON(400, gin.H{"error": "invalid employeeID"})
		return
	}

	days := 1
	if day := c.Query("days"); day != "" {
		dayInt, err := strconv.Atoi(day)
		if err == nil && dayInt > 0 {
			days = dayInt
		} else {
			c.JSON(400, gin.H{"error": "invalid days value"})
			return
		}
	}

	// Build new query string
	newQuery := url.Values{}
	newQuery.Set("employee_id", id.String())
	newQuery.Set("days", strconv.Itoa(days))

	// Clone request with new query string
	reqClone := c.Request.Clone(c.Request.Context())
	reqClone.URL.RawQuery = newQuery.Encode()

	// Create a new gin.Context with the cloned request
	newContext, _ := gin.CreateTestContext(c.Writer)
	newContext.Request = reqClone

	// Call the delegate handler with the new context
	reports.GetEmployeeSalesReport(newContext)
}
