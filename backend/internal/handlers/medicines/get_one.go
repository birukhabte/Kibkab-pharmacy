package medicines

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetMedicineByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid medicine ID"})
		return
	}

	var medicine models.Medicine
	if err := db.DB.First(&medicine, "id = ?", id).Error; err != nil {
		log.Printf("GetMedicineByID: failed to find medicine with ID %s: %s", idParam, err.Error())
		c.JSON(http.StatusNotFound, gin.H{"error": "medicine not found"})
		return
	}

	c.JSON(http.StatusOK, medicine)
}
