package recurring

import (
	"net/http"
	"strconv"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetRecurringSales(c *gin.Context) {
	var recurringSales []models.RecurringSale
	query := db.DB.Model(&models.RecurringSale{})

	// Filter by id (optional)
	if idStr := c.Query("id"); idStr != "" {
		id, err := uuid.Parse(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id format"})
			return
		}
		query = query.Where("id = ?", id)
	}

	// Filter by active (optional)
	if activeStr := c.Query("active"); activeStr != "" {
		active, err := strconv.ParseBool(activeStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid active value"})
			return
		}
		query = query.Where("active = ?", active)
	}

	if err := query.Find(&recurringSales).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch recurring sales"})
		return
	}

	c.JSON(http.StatusOK, recurringSales)
}
