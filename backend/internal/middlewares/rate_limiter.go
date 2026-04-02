// internal/middlewares/rate_limiter.go
package middlewares

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ulule/limiter/v3"
	ginlimiter "github.com/ulule/limiter/v3/drivers/middleware/gin"
	memory "github.com/ulule/limiter/v3/drivers/store/memory"
)

func NewRateLimiterMiddleware(limit, period int64) gin.HandlerFunc {
	rate := limiter.Rate{
		Period: time.Duration(period) * time.Minute,
		Limit:  limit,
	}

	store := memory.NewStore()
	instance := limiter.New(store, rate)

	return ginlimiter.NewMiddleware(instance)
}
