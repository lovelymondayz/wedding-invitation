package middleware

import (
	"os"
	"strings"

	"wedding-api/internal/utils"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.Error(c, 401, "Authorization header required")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			utils.Error(c, 401, "Invalid authorization header format")
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(parts[1], jwtSecret)
		if err != nil {
			utils.Error(c, 401, "Invalid or expired token")
			c.Abort()
			return
		}

		c.Set("adminID", claims.AdminID)
		c.Set("coupleID", claims.CoupleID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// RequireSuperAdmin ensures only super admin can access
func RequireSuperAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("role")
		if role != "super" {
			utils.Error(c, 403, "Super admin access required")
			c.Abort()
			return
		}
		c.Next()
	}
}

// GetCoupleIDFromParam extracts coupleSlug from URL and resolves to couple_id UUID
// Stores "coupleSlug" and "resolvedCoupleID" in context
func CoupleSlugResolver() gin.HandlerFunc {
	return func(c *gin.Context) {
		slug := c.Param("coupleSlug")
		if slug != "" {
			c.Set("coupleSlug", slug)
		}
		c.Next()
	}
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := os.Getenv("FRONTEND_URL")
		if origin == "" {
			origin = "http://localhost:3000"
		}
		c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
