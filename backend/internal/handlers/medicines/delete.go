package medicines

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func DeleteMedicine(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid medicine ID"})
		return
	}

	if err := db.DB.Delete(&models.Medicine{}, "id = ?", id).Error; err != nil {
		log.Printf("DeleteMedicine: failed to delete medicine: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete medicine"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Medicine deleted successfully"})
}
