package employees

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// DeleteEmployee handles DELETE /employees/:id
// Deletes the employee by ID, returns success or 404 if not found.
func DeleteEmployee(c *gin.Context) {
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

	// Attempt to delete by ID
	result := db.DB.Delete(&models.Employee{}, "id = ?", employeeID)
	if result.Error != nil {
		log.Printf("DeleteEmployee: failed to delete employee %s: %s", id, result.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete employee"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "employee not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Employee deleted successfully"})
}
