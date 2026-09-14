package middleware

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"net/http"
	"os"
	"strings"
	"time"

	"wedding-api/internal/utils"

	"github.com/gin-gonic/gin"
)

// GenerateCSRFToken creates a time-based CSRF token (rotates daily)
func GenerateCSRFToken() string {
	h := hmac.New(sha256.New, []byte(os.Getenv("JWT_SECRET")))
	h.Write([]byte(time.Now().Format("2006-01-02")))
	return base64.StdEncoding.EncodeToString(h.Sum(nil))
}

func CSRFMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip CSRF for safe methods and public endpoints
		if c.Request.Method == "GET" || c.Request.Method == "HEAD" || c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}

		// Only apply to admin routes
		if !strings.HasPrefix(c.Request.URL.Path, "/api/admin/") {
			c.Next()
			return
		}

		csrfHeader := c.GetHeader("X-CSRF-Token")
		if csrfHeader == "" {
			// Generate new token if not present (for first load)
			cookie := &http.Cookie{
				Name:     "csrf_token",
				Value:    GenerateCSRFToken(),
				Path:     "/",
				HttpOnly: false, // Must be readable by JavaScript
				Secure:   os.Getenv("APP_ENV") == "production",
				SameSite: http.SameSiteStrictMode,
			}
			http.SetCookie(c.Writer, cookie)
			c.Next()
			return
		}

		// Validate token matches cookie
		csrfCookie, err := c.Cookie("csrf_token")
		if err != nil || csrfCookie != csrfHeader {
			utils.ErrorWithCode(c, 403, "INVALID_CSRF_TOKEN", "CSRF token validation failed")
			c.Abort()
			return
		}

		c.Next()
	}
}
