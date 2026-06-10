package handlers

import (
	"context"

	"wedding-api/internal/database"
	"wedding-api/internal/models"
	"wedding-api/internal/utils"

	"github.com/gin-gonic/gin"
)

// GET /api/admin/couples/:coupleSlug/wishes
func AdminListWishesHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	ctx := context.Background()
	db := database.GetDB()

	coupleID, ok := getCoupleIDFromSlug(ctx, coupleSlug)
	if !ok {
		utils.Error(c, 404, "Couple not found")
		return
	}

	if !authorizeCoupleAccess(c, coupleID) {
		utils.Error(c, 403, "Access denied")
		return
	}

	rows, err := db.Query(ctx, "SELECT id, couple_id, guest_name, message, is_approved, created_at FROM wishes WHERE couple_id = $1 ORDER BY created_at DESC", coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to fetch wishes")
		return
	}
	defer rows.Close()

	wishes := []models.Wish{}
	for rows.Next() {
		var w models.Wish
		if err := rows.Scan(&w.ID, &w.CoupleID, &w.GuestName, &w.Message, &w.IsApproved, &w.CreatedAt); err != nil {
			continue
		}
		wishes = append(wishes, w)
	}

	utils.JSON(c, 200, wishes)
}

// PUT /api/admin/couples/:coupleSlug/wishes/:id
func AdminUpdateWishHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	wishID := c.Param("id")
	ctx := context.Background()
	db := database.GetDB()

	coupleID, ok := getCoupleIDFromSlug(ctx, coupleSlug)
	if !ok {
		utils.Error(c, 404, "Couple not found")
		return
	}

	if !authorizeCoupleAccess(c, coupleID) {
		utils.Error(c, 403, "Access denied")
		return
	}

	var req struct {
		IsApproved *bool `json:"is_approved"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}

	_, err := db.Exec(ctx, "UPDATE wishes SET is_approved = $1 WHERE id = $2 AND couple_id = $3", req.IsApproved, wishID, coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to update wish")
		return
	}

	utils.JSON(c, 200, gin.H{"message": "Wish updated"})
}

// DELETE /api/admin/couples/:coupleSlug/wishes/:id
func AdminDeleteWishHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	wishID := c.Param("id")
	ctx := context.Background()
	db := database.GetDB()

	coupleID, ok := getCoupleIDFromSlug(ctx, coupleSlug)
	if !ok {
		utils.Error(c, 404, "Couple not found")
		return
	}

	if !authorizeCoupleAccess(c, coupleID) {
		utils.Error(c, 403, "Access denied")
		return
	}

	_, err := db.Exec(ctx, "DELETE FROM wishes WHERE id = $1 AND couple_id = $2", wishID, coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to delete wish")
		return
	}

	utils.JSON(c, 200, gin.H{"message": "Wish deleted"})
}
