package handlers

import (
	"context"
	"time"

	"wedding-api/internal/database"
	"wedding-api/internal/models"
	"wedding-api/internal/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token    string `json:"token"`
	Role     string `json:"role"`
	CoupleID string `json:"couple_id"`
}

func LoginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}

	ctx := context.Background()
	db := database.GetDB()

	var admin models.Admin
	var coupleID *string
	err := db.QueryRow(ctx, "SELECT id, username, password_hash, couple_id FROM admins WHERE username = $1", req.Username).Scan(
		&admin.ID, &admin.Username, &admin.PasswordHash, &coupleID,
	)
	if err != nil {
		utils.Error(c, 401, "Invalid username or password")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)); err != nil {
		utils.Error(c, 401, "Invalid username or password")
		return
	}

	role := "couple"
	coupleIDStr := ""
	if coupleID == nil {
		role = "super"
	} else {
		coupleIDStr = *coupleID
	}

	jwtSecret := c.GetString("jwtSecret")
	token, err := utils.GenerateToken(admin.ID, coupleIDStr, role, jwtSecret)
	if err != nil {
		utils.Error(c, 500, "Failed to generate token")
		return
	}

	utils.JSON(c, 200, LoginResponse{
		Token:    token,
		Role:     role,
		CoupleID: coupleIDStr,
	})
}

func MeHandler(c *gin.Context) {
	adminID, _ := c.Get("adminID")
	coupleID, _ := c.Get("coupleID")
	role, _ := c.Get("role")

	ctx := context.Background()
	db := database.GetDB()

	var admin models.Admin
	err := db.QueryRow(ctx, "SELECT id, username, couple_id, created_at FROM admins WHERE id = $1", adminID).Scan(
		&admin.ID, &admin.Username, &admin.CoupleID, &admin.CreatedAt,
	)
	if err != nil {
		utils.Error(c, 404, "Admin not found")
		return
	}

	utils.JSON(c, 200, gin.H{
		"id":        admin.ID,
		"username":  admin.Username,
		"role":      role,
		"couple_id": coupleID,
		"created_at": admin.CreatedAt,
	})
}

// CreateCoupleHandler — POST /api/couples (public, from homepage form)
func CreateCoupleHandler(c *gin.Context) {
	var req struct {
		GroomName    string `json:"groom_name" binding:"required"`
		BrideName    string `json:"bride_name" binding:"required"`
		WeddingDate  string `json:"wedding_date" binding:"required"`
		WeddingTime  string `json:"wedding_time"`
		VenueName    string `json:"venue_name"`
		VenueAddress string `json:"venue_address"`
		Username     string `json:"username" binding:"required"`
		Password     string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}

	ctx := context.Background()
	db := database.GetDB()

	slug := utils.Slugify(req.GroomName) + "-" + utils.Slugify(req.BrideName) + "-" + uuidShort()

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.Error(c, 500, "Failed to hash password")
		return
	}

	var coupleID string
	err = db.QueryRow(ctx, `INSERT INTO couples (slug, groom_name, bride_name, wedding_date, wedding_time, venue_name, venue_address, is_published) VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING id`,
		slug, req.GroomName, req.BrideName, req.WeddingDate, req.WeddingTime, req.VenueName, req.VenueAddress,
	).Scan(&coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to create couple: "+err.Error())
		return
	}

	var adminID int
	err = db.QueryRow(ctx, `INSERT INTO admins (username, password_hash, couple_id) VALUES ($1, $2, $3) RETURNING id`,
		req.Username, string(hash), coupleID,
	).Scan(&adminID)
	if err != nil {
		utils.Error(c, 500, "Failed to create admin: "+err.Error())
		return
	}

	jwtSecret := c.GetString("jwtSecret")
	token, err := utils.GenerateToken(adminID, coupleID, "couple", jwtSecret)
	if err != nil {
		utils.Error(c, 500, "Failed to generate token")
		return
	}

	utils.JSON(c, 201, gin.H{
		"couple_id":  coupleID,
		"slug":       slug,
		"token":      token,
		"role":       "couple",
		"created_at": time.Now().UTC(),
	})
}

func uuidShort() string {
	return utils.Slugify(time.Now().Format("20060102150405"))[:8]
}
