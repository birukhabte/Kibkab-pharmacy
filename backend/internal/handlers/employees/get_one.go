package employees

import (
	"errors"
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// GetEmployeeByID handles GET /employees/:id
// Returns a single employee or 404 if not found.
// Logs internal errors with function name first.
func GetEmployeeByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "employee ID is required"})
		return
	}

	employeeID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid employee ID format"})
		return
	}

	var emp models.Employee
	if err := db.DB.First(&emp, "id = ?", employeeID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "employee not found"})
			return
		}
		log.Printf("GetEmployeeByID: failed to fetch employee %s: %s", id, err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch employee"})
		return
	}

	c.JSON(http.StatusOK, emp)
}
