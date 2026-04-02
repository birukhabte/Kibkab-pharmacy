package reports

import (
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
)

func TotalMedicineStock(c *gin.Context) {

	var count int64

	err := db.DB.
		Model(&models.Medicine{}).
		Count(&count).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to count medicines"})
		return
	}

	var total float64
	err = db.DB.
		Model(&models.MedicineStock{}).
		Select("COALESCE(SUM(quantity), 0)"). // avoid null if table is empty
		Scan(&total).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to calculate total quantity"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"medicine_counts" : count , "total_quantity": total})
}
