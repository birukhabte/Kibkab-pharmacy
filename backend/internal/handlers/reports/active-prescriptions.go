package reports

import (
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
)

func CountActiveRecurringSales(c *gin.Context) {
	var count int64

	err := db.DB.
		Model(&models.RecurringSale{}).
		Where("active = ?", true).
		Count(&count).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to count active recurring sales"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}
