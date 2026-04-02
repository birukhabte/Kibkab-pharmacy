package recurring

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// DELETE /recurring/:id
func DeleteRecurringSale(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	recurringID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID format"})
		return
	}

	result := db.DB.Delete(&models.RecurringSale{}, "id = ?", recurringID)
	if result.Error != nil {
		log.Printf("DeleteRecurringSale: failed to delete: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete recurring sale"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "recurring sale not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "recurring sale deleted successfully"})
}
