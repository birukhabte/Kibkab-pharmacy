package sales

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/internal/handlers/activity"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func UpdateSaleStatus(c *gin.Context) {

	IemployeeID, ok := c.Get("employee_id")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to get employee id"})
		return
	}

	employeeID, ok := IemployeeID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to assert employee if"})
		return
	}

	saleIDStr := c.Param("id")
	saleID, err := uuid.Parse(saleIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sale ID"})
		return
	}

	var body struct {
		Status string `json:"status" binding:"required,oneof=completed canceled"`
	}

	// get the request body
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request", "details": err.Error()})
		return
	}

	// get the sale by id
	var sale models.Sale
	if err := db.DB.Preload("Items").First(&sale, "id = ?", saleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "sale not found"})
		return
	}

	if sale.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "only pending sales can be updated"})
		return
	}

	// Enforce branch check here
	branchVal, ok := c.Get("branch_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "branch ID not found in context"})
		return
	}
	userBranchID, ok := branchVal.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid branch ID"})
		return
	}
	if userBranchID != *sale.BranchID {
		c.JSON(http.StatusForbidden, gin.H{"error": "you are not allowed to approve or cancel this sale"})
		return
	}

	tx := db.DB.Begin()

	if body.Status == "completed" {

		// reduce stock and update recurring sale if applicable
		for _, item := range sale.Items {

			// reduce stock
			var stock models.MedicineStock
			err := tx.Where("branch_id = ? AND medicine_id = ?", sale.BranchID, item.MedicineID).First(&stock).Error
			if err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "stock not found"})
				return
			}
			if stock.Quantity < item.Quantity {
				tx.Rollback()
				c.JSON(http.StatusBadRequest, gin.H{"error": "stock not enough during approval", "medicine_id": item.MedicineID})
				return
			}
			stock.Quantity -= item.Quantity
			if err := tx.Save(&stock).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update stock"})
				return
			}

			//  Update recurring sale if applicable
			var recurring models.RecurringSale
			err = tx.
				Where("customer_id = ? AND medicine_id = ? AND active = ?", sale.CustomerID, item.MedicineID, true).
				First(&recurring).Error

			if err == nil {
				recurring.SoldQuantity += int(item.Quantity)
				recurring.LastPurchaseDate = sale.SaleDate
				if err := tx.Save(&recurring).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update recurring sale", "medicine_id": item.MedicineID})
					return
				}
			} else if err != gorm.ErrRecordNotFound {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query recurring sale", "medicine_id": item.MedicineID})
				return
			}
		}

		// update the sale status
		if err := tx.Model(&sale).Updates(map[string]any{
			"status":      "completed",
			"approved_by": &employeeID,
		}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update sale"})
			return
		}

		// Fetch employee role info
		var role struct {
			Commission float64
			Threshold  float64
		}
		err := tx.Raw(`
        SELECT roles.commission, roles.threshold
        FROM employees 
        JOIN roles ON employees.role_id = roles.id
        WHERE employees.id = ?
    `, sale.EmployeeID).Scan(&role).Error
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch role commission"})
			return
		}

		// Get total sales by this employee for the same day
		var totalSold float64
		err = tx.Model(&models.Sale{}).
			Where("employee_id = ? AND DATE(sale_date) = DATE(?) AND status = ?", sale.EmployeeID, sale.SaleDate, "completed").
			Select("COALESCE(SUM(total_price),0)").Scan(&totalSold).Error
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to calculate total sold"})
			return
		}

		// Compute commission earned so far today
		caps := int(totalSold / role.Threshold)
		amount := float64(caps) * role.Threshold * (role.Commission / 100)
		saleDateOnly := sale.SaleDate.Format("2006-01-02")

		// Upsert Commission record for today
		var commission models.Commission
		err = tx.Where("employee_id = ? AND date = ?", sale.EmployeeID, saleDateOnly).First(&commission).Error
		if err == gorm.ErrRecordNotFound {
			// Record not found, create new commission entry
			commission = models.Commission{
				ID:         uuid.New(),
				EmployeeID: sale.EmployeeID,
				Date:       sale.SaleDate,
				TotalSold:  totalSold,
				Threshold:  role.Threshold,
				Commission: role.Commission,
				Amount:     amount,
				Paid:       false,
				CreatedAt:  time.Now(),
			}
			if err := tx.Create(&commission).Error; err != nil {
				tx.Rollback()
				log.Println(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create commission record"})
				return
			}
		} else if err == nil {
			// Commission record exists - update fields with new data
			commission.TotalSold = totalSold
			commission.Commission = role.Commission
			commission.Amount = amount
			commission.UpdatedAt = time.Now()
			commission.Threshold = role.Threshold
			if err := tx.Save(&commission).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update commission record"})
				return
			}
		} else {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query commission"})
			return
		}

	} else if body.Status == "canceled" {
		if err := tx.Model(&sale).Updates(map[string]any{
			"status":      "canceled",
			"approved_by": &employeeID,
		}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to cancel sale"})
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to commit transaction"})
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

	// Log activity after commit
	var action, message string
	if body.Status == "completed" {
		action = "approve_sale"
		message = fmt.Sprintf("%s: Approved with total price %.2f", username, sale.TotalPrice)
	} else if body.Status == "canceled" {
		action = "cancel_sale"
		message = fmt.Sprintf("%s: Canceled sale.", username)
	}

	err = activity.LogActivity(
		employeeID,
		action,
		"sale",
		&sale.ID,
		message,
	)
	if err != nil {
		log.Printf("Failed to log activity: %v", err)
	}

	c.JSON(http.StatusOK, gin.H{"message": "sale status updated", "status": body.Status})
}
