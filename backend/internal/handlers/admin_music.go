package handlers

import (
	"context"

	"wedding-api/internal/database"
	"wedding-api/internal/models"
	"wedding-api/internal/utils"

	"github.com/gin-gonic/gin"
)

// POST /api/admin/couples/:coupleSlug/music
func AdminCreateMusicHandler(c *gin.Context) {
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

	var req struct {
		Title     string `json:"title"`
		URL       string `json:"url" binding:"required"`
		SortOrder int    `json:"sort_order"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}

	var track models.MusicTrack
	err := db.QueryRow(ctx, `INSERT INTO music_tracks (couple_id, title, url, sort_order) VALUES ($1, $2, $3, $4) RETURNING id, couple_id, title, url, is_active, sort_order, created_at`,
		coupleID, req.Title, req.URL, req.SortOrder,
	).Scan(&track.ID, &track.CoupleID, &track.Title, &track.URL, &track.IsActive, &track.SortOrder, &track.CreatedAt)
	if err != nil {
		utils.Error(c, 500, "Failed to add music track")
		return
	}

	utils.JSON(c, 201, track)
}

// PUT /api/admin/couples/:coupleSlug/music/:id/activate
func AdminActivateMusicHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	trackID := c.Param("id")
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

	db.Exec(ctx, "UPDATE music_tracks SET is_active = false WHERE couple_id = $1", coupleID)
	_, err := db.Exec(ctx, "UPDATE music_tracks SET is_active = true WHERE id = $1 AND couple_id = $2", trackID, coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to activate music track")
		return
	}

	utils.JSON(c, 200, gin.H{"message": "Music track activated"})
}

// DELETE /api/admin/couples/:coupleSlug/music/:id
func AdminDeleteMusicHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	trackID := c.Param("id")
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

	_, err := db.Exec(ctx, "DELETE FROM music_tracks WHERE id = $1 AND couple_id = $2", trackID, coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to delete music track")
		return
	}

	utils.JSON(c, 200, gin.H{"message": "Music track deleted"})
}
