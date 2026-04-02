package suppliers

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
)

func GetAllSuppliers(c *gin.Context) {
	var suppliers []models.Supplier
	if err := db.DB.Find(&suppliers).Error; err != nil {
		log.Printf("GetAllSuppliers: failed to fetch suppliers: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve suppliers"})
		return
	}
	c.IndentedJSON(http.StatusOK, suppliers)
}
