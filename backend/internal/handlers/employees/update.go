package employees

import (
	"errors"
	"log"
	"net/http"
	"reflect"
	"strings"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/internal/utils"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UpdateEmployee handles PUT /employees/:id
// Updates employee details including optional password update.
func UpdateEmployee(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "employee ID is required"})
		return
	}

	employeeID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid employee ID format"})
		return
	}

	var body struct {
		BranchID  *uuid.UUID `json:"branch_id"`
		RoleID    uuid.UUID  `json:"role_id" binding:"required"`
		Email     string     `json:"email" binding:"required,email"`
		FirstName string     `json:"first_name" binding:"required"`
		LastName  string     `json:"last_name" binding:"required"`
		Username  string     `json:"username" binding:"required"`
		Phone     string     `json:"phone" binding:"required"`
		Active    bool       `json:"active" binding:"required"`
		Password  string     `json:"password,omitempty"` // optional, min length can be validated manually if needed
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	body.Phone = strings.TrimSpace(body.Phone)
	body.Username = strings.TrimSpace(body.Username)
	body.Password = strings.TrimSpace(body.Password)

	// check for phone number validity
	if body.Phone == "" || !utils.IsPhoneValid(body.Phone) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid phone number format"})
		return
	}

	// check for valid email
	if body.Email == "" || !utils.ValidateEmail(body.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid email format"})
		return
	}

	// check for valid username
	if len(body.Username) < 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "username must be atleast of five characters"})
		return
	}

	var employee models.Employee
	if err := db.DB.First(&employee, "id = ?", employeeID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "employee not found"})
			return
		}
		log.Printf("UpdateEmployee: failed to fetch employee %s: %s", id, err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch employee"})
		return
	}

	// Update fields
	original := employee

	employee.BranchID = body.BranchID
	employee.RoleID = body.RoleID
	employee.Email = body.Email
	employee.FirstName = body.FirstName
	employee.Username = body.Username
	employee.LastName = body.LastName
	employee.Phone = body.Phone
	employee.Active = body.Active

	// If password provided, hash and update
	if body.Password != "" {
		passwordHash, err := utils.HashString(body.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
			return
		}
		employee.PasswordHashed = passwordHash
	}

	// Check if all fields are the same
	if reflect.DeepEqual(original, employee) {
		c.JSON(http.StatusOK, gin.H{"message": "no new values provided"})
		return
	}

	employee.UpdatedAt = time.Now()

	if err := db.DB.Save(&employee).Error; err != nil {

		// Check for MySQL duplicate entry error
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			msg := mysqlErr.Message
			switch {
			case strings.Contains(msg, "uni_employees_email"):
				c.JSON(http.StatusConflict, gin.H{"error": "employee with that email already exists"})
				return
			case strings.Contains(msg, "uni_employees_username"):
				c.JSON(http.StatusConflict, gin.H{"error": "username already taken"})
				return
			default:
				c.JSON(http.StatusConflict, gin.H{"error": "duplicate entry"})
				return
			}
		}

		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1452 {
			// MySQL foreign key constraint error (1452)
			if strings.Contains(mysqlErr.Message, "fk_employees_role") {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role_id: role does not exist"})
				return
			}
			if strings.Contains(mysqlErr.Message, "fk_employees_branch") {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid branch_id: branch does not exist"})
				return
			}
		}

		log.Printf("UpdateEmployee: failed to update employee %s: %s", id, err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update employee"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         employee.ID,
		"branch_id":  employee.BranchID,
		"role_id":    employee.RoleID,
		"email":      employee.Email,
		"first_name": employee.FirstName,
		"last_name":  employee.LastName,
		"username":   employee.Username,
		"phone":      employee.Phone,
		"active":     employee.Active,
		"created_at": employee.CreatedAt,
		"updated_at": employee.UpdatedAt,
	})
}

