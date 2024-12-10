package medicines

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

func UpdateMedicine(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid medicine ID"})
		return
	}

	var req struct {
		Name        string `json:"name" binding:"required"`
		Brand       string `json:"brand" binding:"required"`
		Category    string `json:"category" binding:"required"`
		Description string `json:"description" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var medicine models.Medicine
	if err := db.DB.First(&medicine, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "medicine not found"})
		return
	}

	original := medicine
	medicine.Name = req.Name
	medicine.Brand = req.Brand
	medicine.Category = req.Category
	medicine.Description = req.Description

	// Check if all fields are the same
	if reflect.DeepEqual(original, medicine) {
		c.JSON(http.StatusOK, gin.H{"message": "no new values provided"})
		return
	}

	medicine.UpdatedAt = time.Now()

	if err := db.DB.Save(&medicine).Error; err != nil {
		log.Printf("UpdateMedicine: failed to update medicine: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update medicine"})
		return
	}

	c.JSON(http.StatusOK, medicine)
}



