package auth

import (
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func Login(c *gin.Context) {
	var body struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	body.Username = strings.TrimSpace(body.Username)
	body.Password = strings.TrimSpace(body.Password)

	var user models.Employee
	result := db.DB.Where("username = ?", body.Username).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "user not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch user",
		})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHashed), []byte(body.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "incorrect password",
		})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 3).Unix(),
	})

	// Sign and get the complete encoded token as a string using the secret
	JWT_SECRET := os.Getenv("JWT_SECRET")
	tokenString, err := token.SignedString([]byte(JWT_SECRET))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "unable to generate jwt token",
		})
		return
	}

	type PermissionInfo struct {
		ID   string
		Name string
	}

	var permissions []PermissionInfo

	err = db.DB.
		Table("role_permissions").
		Select("permissions.id, permissions.name").
		Joins("JOIN permissions ON role_permissions.permission_id = permissions.id").
		Where("role_permissions.role_id = ?", user.RoleID).
		Scan(&permissions).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user permissions"})
		return
	}

	response := struct {
		models.Employee
		Permission []PermissionInfo
	}{
		user,
		permissions,
	}

	// set the cookies
	c.SetSameSite(http.SameSiteNoneMode) // allow cross-site
	c.SetCookie("Authorization", tokenString, 60*60*3, "/", "", true, true)
	c.JSON(http.StatusOK, response)
}



