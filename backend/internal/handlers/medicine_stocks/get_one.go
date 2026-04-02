package medicine_stock

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetStockByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid stock ID"})
		return
	}

	var stock models.MedicineStock
	if err := db.DB.Preload("Branch").Preload("Medicine").First(&stock, "id = ?", id).Error; err != nil {
		log.Printf("GetStockByID: failed to retrieve stock: %s", err.Error())
		c.JSON(http.StatusNotFound, gin.H{"error": "stock not found"})
		return
	}

	c.JSON(http.StatusOK, stock)
}
