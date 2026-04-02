package employees

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
)

// GetAllEmployees handles GET /employees
// Returns all employees with fields matching the JSON tags in the Employee model.
// PasswordHash is omitted from JSON automatically by `json:"-"`.
func GetAllEmployees(c *gin.Context) {
	var employees []models.Employee

	if err := db.DB.Find(&employees).Error; err != nil {
		log.Printf("GetAllEmployees: failed to fetch employees: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch employees"})
		return
	}

	c.JSON(http.StatusOK, employees)
}
