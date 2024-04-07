package medicines

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
)

func GetAllMedicines(c *gin.Context) {
	var medicines []models.Medicine
	if err := db.DB.Find(&medicines).Error; err != nil {
		log.Printf("GetAllMedicines: failed to fetch medicines: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve medicines"})
		return
	}
	c.JSON(http.StatusOK, medicines)
}


