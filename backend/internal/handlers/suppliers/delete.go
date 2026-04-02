package suppliers

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func DeleteSupplier(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid supplier ID"})
		return
	}

	if err := db.DB.Delete(&models.Supplier{}, "id = ?", id).Error; err != nil {
		log.Printf("DeleteSupplier: failed to delete supplier: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete supplier"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Supplier deleted successfully"})
}
