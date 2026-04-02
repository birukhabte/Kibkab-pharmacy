package suppliers

import (
	"fmt"
	"log"
	"net/http"
	"reflect"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/internal/handlers/activity"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func UpdateSupplier(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid supplier ID"})
		return
	}

	var body struct {
		Name    string `gorm:"not null" json:"name" binding:"required"`
		Phone   string `gorm:"not null" json:"phone" binding:"required"`
		Email   string `gorm:"" json:"email"`
		Address string `gorm:"" json:"address"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	var supplier models.Supplier
	if err := db.DB.First(&supplier, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "supplier not found"})
		return
	}

	original := supplier
	// update the new values
	supplier.Name = body.Name
	supplier.Phone = body.Phone
	supplier.Email = body.Email

	// Check if all fields are the same
	if reflect.DeepEqual(original, supplier) {
		c.JSON(http.StatusOK, gin.H{"message": "no new values provided"})
		return
	}
	supplier.UpdatedAt = time.Now()

	// save the result
	if err := db.DB.Save(&supplier).Error; err != nil {
		log.Printf("UpdateSupplier: failed to update supplier: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update supplier"})
		return
	}

	IemployeeID, ok := c.Get("employee_id")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to get employee id"})
		return
	}

	employeeID, ok := IemployeeID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to assert employee id"})
		return
	}

	Iusername, ok := c.Get("username")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to get employee username"})
		return
	}

	username, ok := Iusername.(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to assert employee username"})
	}

	err = activity.LogActivity(
		employeeID,
		"update_supplier",
		"supplier",
		&id,
		fmt.Sprintf("%s: Updated supplier with name %s", username, supplier.Name),
	)
	if err != nil {
		log.Printf("Failed to log supplier update activity: %v", err)
	}

	c.IndentedJSON(http.StatusOK, supplier)
}
