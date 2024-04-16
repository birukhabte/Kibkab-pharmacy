package commissions

import (
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func PayCommission(c *gin.Context) {
	commissionIDStr := c.Param("id")
	commissionID, err := uuid.Parse(commissionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid commission id"})
		return
	}

	var commission models.Commission
	err = db.DB.Where("id = ?", commissionID).First(&commission).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "commission record not found"})
		return
	}

	// Ensure commission is at least 1 day old
	if time.Since(commission.Date) < 24*time.Hour {
		c.JSON(http.StatusBadRequest, gin.H{"error": "commission can only be paid at least one day after the sale date"})
		return
	}

	commission.Paid = true
	commission.UpdatedAt = time.Now()

	if err := db.DB.Save(&commission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update commission"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "commission marked as paid"})
}

