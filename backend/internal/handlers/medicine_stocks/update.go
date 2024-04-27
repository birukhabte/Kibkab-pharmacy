package medicine_stock

import (
	"log"
	"net/http"
	"reflect"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func UpdateStock(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid stock ID"})
		return
	}

	var body struct {
		Quantity     float64     `json:"quantity"`
		SellingPrice float64 `json:"selling_price"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	var stock models.MedicineStock
	if err := db.DB.First(&stock, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "stock not found"})
		return
	}

	original := stock
	stock.Quantity = body.Quantity
	stock.SellingPrice = body.SellingPrice
	if reflect.DeepEqual(original, stock) {
		c.JSON(http.StatusOK, gin.H{"message": "no new values provided"})
		return
	}

	stock.UpdatedAt = time.Now()

	if err := db.DB.Save(&stock).Error; err != nil {
		log.Printf("UpdateStock: failed to update stock: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update stock"})
		return
	}

	c.JSON(http.StatusOK, stock)
}

