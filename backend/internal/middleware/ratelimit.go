package middleware

import (
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type rateLimiter struct {
	attempts map[string][]time.Time
	mu       sync.Mutex
	max      int
	window   time.Duration
}

func newRateLimiter(max int, window time.Duration) *rateLimiter {
	return &rateLimiter{
		attempts: make(map[string][]time.Time),
		max:      max,
		window:   window,
	}
}

func (rl *rateLimiter) isAllowed(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-rl.window)

	valid := rl.attempts[key][:0]
	for _, t := range rl.attempts[key] {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}
	rl.attempts[key] = valid

	if len(valid) >= rl.max {
		return false
	}

	rl.attempts[key] = append(valid, now)
	return true
}

var loginLimiter = newRateLimiter(5, 5*time.Minute)

func RateLimitLogin() gin.HandlerFunc {
	return func(c *gin.Context) {
		key := c.ClientIP()
		if !loginLimiter.isAllowed(key) {
			c.JSON(429, gin.H{"error": gin.H{"code": "RATE_LIMITED", "message": "Too many login attempts. Please try again later."}})
			c.Abort()
			return
		}
		c.Next()
	}
}
