package employees

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/internal/handlers/activity"
	"github.com/gechjs/Pharmacy-App/internal/utils"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
)

// CreateEmployee handles POST /employees
// Creates a new employee with hashed password, returns the created employee (without password).
func CreateEmployee(c *gin.Context) {
	var body struct {
		BranchID  *uuid.UUID `json:"branch_id"`
		RoleID    uuid.UUID  `json:"role_id" binding:"required"`
		Email     string     `json:"email" binding:"required"`
		FirstName string     `json:"first_name" binding:"required"`
		LastName  string     `json:"last_name" binding:"required"`
		Username  string     `json:"username" binding:"required,min=5"`
		Phone     string     `json:"phone" binding:"required"`
		Password  string     `json:"password" binding:"required,min=8"`
		Active    bool       `json:"active"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("invalid request body: %s", err.Error())})
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

	// Hash the password securely
	passwordHash, err := utils.HashString(body.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	employee := models.Employee{
		ID:             uuid.New(),
		BranchID:       body.BranchID,
		RoleID:         body.RoleID,
		Email:          body.Email,
		FirstName:      body.FirstName,
		LastName:       body.LastName,
		Username:       body.Username,
		Phone:          body.Phone,
		PasswordHashed: passwordHash,
		Active:         body.Active,
		CreatedAt:      time.Now(),
	}

	if err := db.DB.Create(&employee).Error; err != nil {

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

		log.Printf("CreateEmployee: Failed to create employee: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create employee"})
		return
	}

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
		employeeID, // or the employee performing the action if different
		"create_employee",
		"employees",
		&employee.ID,
		fmt.Sprintf("%s: Created new employee ", username, employee.Username),
	)
	if err != nil {
		log.Printf("Failed to log create employee activity: %v", err)
	}

	c.JSON(http.StatusCreated, employee)
}


