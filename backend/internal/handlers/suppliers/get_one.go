package suppliers

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetSupplierByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid supplier ID"})
		return
	}

	var supplier models.Supplier
	if err := db.DB.First(&supplier, "id = ?", id).Error; err != nil {
		log.Printf("GetSupplierByID: failed to find supplier with ID %s: %s", idParam, err.Error())
		c.JSON(http.StatusNotFound, gin.H{"error": "supplier not found"})
		return
	}

	c.IndentedJSON(http.StatusOK, supplier)
}
