package medicine_stock

import (
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
)

func CreateStock(c *gin.Context) {
	var body struct {
		BranchID      uuid.UUID `json:"branch_id" binding:"required"`
		MedicineID    uuid.UUID `json:"medicine_id" binding:"required"`
		ExpiryDate    time.Time `json:"expiry_date" binding:"required"`
		PurchasePrice float64   `json:"purchase_price" binding:"required"`
		SellingPrice  float64   `json:"selling_price"`
		Quantity      float64   `json:"quantity" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if body.ExpiryDate.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "expiry date can not be in the past"})
		return
	}

	stock := models.MedicineStock{
		ID:            uuid.New(),
		BranchID:      body.BranchID,
		MedicineID:    body.MedicineID,
		ExpiryDate:    body.ExpiryDate,
		PurchasePrice: body.PurchasePrice,
		SellingPrice:  body.SellingPrice,
		Quantity:      body.Quantity,
		CreatedAt:     time.Now(),
	}

	if err := db.DB.Create(&stock).Error; err != nil {
		// Check for MySQL duplicate entry error
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			c.JSON(http.StatusConflict, gin.H{"error": "stock already exists"})
			return
		}
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1452 {
			// MySQL foreign key constraint error (1452)
			if strings.Contains(mysqlErr.Message, "fk_medicine_stocks_branch") {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid branch_id: branch does not exist"})
				return
			}
			if strings.Contains(mysqlErr.Message, "fk_medicine_stocks_medicine") {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid medicine_id: medicine does not exist"})
				return
			}
		}

		log.Printf("CreateStock: failed to create stock: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create stock"})
		return
	}

	c.JSON(http.StatusCreated, stock)
}
