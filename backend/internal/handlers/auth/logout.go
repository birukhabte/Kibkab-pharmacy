package auth

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func Logout(c *gin.Context) {
	// delete the authentication cookie after logout
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "Authorization",
		Value:    "",
		Path:     "/",
		Domain:   os.Getenv("DOMAIN"),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
		MaxAge:   -1,
	})

	c.Status(http.StatusOK)
}
