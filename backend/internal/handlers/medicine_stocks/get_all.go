package medicine_stock

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
)

func GetAllStock(c *gin.Context) {
	branchID := c.Query("branch_id")
	var stock []models.MedicineStock

	// can return all stock with branch specified
	query := db.DB.Preload("Branch").Preload("Medicine")
	if branchID != "" {
		query = query.Where("branch_id = ?", branchID)
	}

	if err := query.Find(&stock).Error; err != nil {
		log.Printf("GetAllStock: failed to retrieve stock: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve medicine stock"})
		return
	}

	c.JSON(http.StatusOK, stock)
}


