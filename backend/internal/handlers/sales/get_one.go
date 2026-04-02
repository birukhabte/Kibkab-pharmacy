package sales

import (
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetSaleByID(c *gin.Context) {
	saleIDStr := c.Param("id")
	saleID, err := uuid.Parse(saleIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sale ID"})
		return
	}

	var sale models.Sale
	err = db.DB.
		Preload("Items").
		Preload("Customer").
		First(&sale, "id = ?", saleID).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "sale not found"})
		return
	}

	c.JSON(http.StatusOK, sale)
}
